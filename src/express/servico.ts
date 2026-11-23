// Acesso de máquina (fase 2 do Portão): grant client_credentials, sem usuário.
// - Quem LÊ (o CG): obterTokenDeServico(recurso) pede ao Portão um JWT com aud = recurso.
// - Quem EXPÕE (os apps com feed): exigirServico(escopo) valida esse JWT no Authorization: Bearer.
import type { RequestHandler } from "express";
import * as oidc from "openid-client";
import { errors, jwtVerify, type JWTVerifyGetKey } from "jose";

/** Escopo do Contrato de Feed: o único escopo de máquina do Portão hoje. */
export const ESCOPO_FEED = "feed:read";

/** Renova o token quando faltar menos que isto para vencer. */
const MARGEM_RENOVACAO_MS = 60 * 1000;

/** Quem chamou uma rota protegida por `exigirServico` (em `req.servico`). */
export interface ServicoPortao {
  /** client_id de quem pediu o token (ex.: o client do CG). */
  clientId: string;
  escopos: string[];
}

/** O Portão recusou emitir o token de serviço (ex.: `invalid_target`, `unauthorized_client`). */
export class ErroTokenDeServico extends Error {
  constructor(
    readonly recurso: string,
    /** Código OAuth devolvido pelo Portão, ou null se a falha foi de rede/configuração. */
    readonly codigo: string | null,
    options?: { cause?: unknown },
  ) {
    super(`Portão recusou o token de serviço para ${recurso}: ${codigo ?? "falha ao falar com o Portão"}`, options);
    this.name = "ErroTokenDeServico";
  }
}

interface Dependencias {
  obterConfiguracao: () => Promise<oidc.Configuration>;
  obterJwks: () => Promise<JWTVerifyGetKey>;
  log: (nivel: "info" | "warn" | "error", mensagem: string) => void;
  /** Origem de produção deste app (o `aud` que ele aceita), ou null se não configurada. */
  recurso: string | null;
}

/** Recurso = origem (é o identifier cadastrado no Portão): "https://x.com/" e "https://x.com" são o mesmo. */
function normalizarRecurso(recurso: string): string {
  return new URL(recurso).origin;
}

export function criarServico(dep: Dependencias) {
  // Um token por (escopo, recurso), guardado só em memória. Guarda a Promise: chamadas
  // simultâneas esperam o mesmo pedido em vez de pedir vários tokens.
  const cache = new Map<string, Promise<{ token: string; expiraEm: number }>>();

  async function pedirToken(recurso: string, escopo: string) {
    const config = await dep.obterConfiguracao();
    try {
      const resposta = await oidc.clientCredentialsGrant(config, { scope: escopo, resource: recurso });
      const segundos = resposta.expiresIn() ?? 0;
      return { token: resposta.access_token, expiraEm: Date.now() + segundos * 1000 };
    } catch (erro) {
      const codigo = (erro as { error?: unknown }).error;
      const codigoTexto = typeof codigo === "string" ? codigo : null;
      dep.log("warn", `token de serviço para ${recurso} recusado: ${codigoTexto ?? (erro as Error).name}`);
      throw new ErroTokenDeServico(recurso, codigoTexto, { cause: erro });
    }
  }

  /**
   * Token de serviço para chamar o app `recurso` (a ORIGEM DE PRODUÇÃO dele, ex.:
   * "https://games.gatourso.com", mesmo em dev). Fica em memória até 1 min antes de vencer.
   * Lança `ErroTokenDeServico` se o Portão recusar.
   */
  async function obterTokenDeServico(recurso: string, escopo: string = ESCOPO_FEED): Promise<string> {
    const alvo = normalizarRecurso(recurso);
    const chave = `${escopo} ${alvo}`;

    const guardado = cache.get(chave);
    if (guardado) {
      const atual = await guardado.catch(() => null);
      if (atual && atual.expiraEm - Date.now() > MARGEM_RENOVACAO_MS) return atual.token;
      if (cache.get(chave) === guardado) cache.delete(chave);
    }

    let pedido = cache.get(chave);
    if (!pedido) {
      const novo = pedirToken(alvo, escopo);
      cache.set(chave, novo);
      novo.catch(() => {
        if (cache.get(chave) === novo) cache.delete(chave);
      });
      pedido = novo;
    }
    return (await pedido).token;
  }

  /** Descarta o token guardado (ex.: o app respondeu 401). O próximo `obterTokenDeServico` pede outro. */
  function esquecerTokenDeServico(recurso: string, escopo: string = ESCOPO_FEED): void {
    cache.delete(`${escopo} ${normalizarRecurso(recurso)}`);
  }

  /**
   * Exige um token de serviço do Portão (`Authorization: Bearer`) com o `escopo`.
   * Confere assinatura (JWKS), `iss`, `aud` = `recurso` deste app, `typ: at+jwt`, validade
   * e que é um token de máquina (sem usuário). Preenche `req.servico`.
   * Montar ANTES do `exigirLogin` (quem chama não tem cookie de sessão).
   */
  function exigirServico(escopo: string = ESCOPO_FEED): RequestHandler {
    if (!dep.recurso) {
      throw new Error(
        "gatur-portao-client: exigirServico precisa de `recurso` (a origem de produção do app) nas opções do criarPortao",
      );
    }
    const recurso = normalizarRecurso(dep.recurso);

    const recusar = (res: Parameters<RequestHandler>[1], status: 401 | 403, motivo: string) => {
      res.setHeader(
        "WWW-Authenticate",
        status === 401 ? 'Bearer error="invalid_token"' : `Bearer error="insufficient_scope", scope="${escopo}"`,
      );
      res.status(status).json({
        erro:
          status === 401
            ? { codigo: "TOKEN_DE_SERVICO_INVALIDO", mensagem: "Token de serviço do Portão ausente ou inválido." }
            : { codigo: "ESCOPO_INSUFICIENTE", mensagem: `O token de serviço não tem o escopo ${escopo}.` },
      });
      dep.log("warn", `token de serviço recusado: ${motivo}`);
    };

    return (req, res, next) => {
      const cabecalho = req.get("authorization") ?? "";
      const [tipo, token] = cabecalho.split(" ");
      if (tipo?.toLowerCase() !== "bearer" || !token) {
        recusar(res, 401, "sem Authorization: Bearer");
        return;
      }

      (async () => {
        const config = await dep.obterConfiguracao();
        const { payload } = await jwtVerify(token, await dep.obterJwks(), {
          issuer: config.serverMetadata().issuer,
          audience: recurso,
          typ: "at+jwt",
          clockTolerance: 30,
        });
        const clientId = typeof payload.client_id === "string" ? payload.client_id : null;
        // client_credentials: sub = client_id. Token de usuário (sub = id da pessoa) não serve aqui.
        if (!clientId || payload.sub !== clientId) {
          recusar(res, 401, "não é um token de máquina");
          return;
        }
        const escopos = typeof payload.scope === "string" ? payload.scope.split(" ").filter(Boolean) : [];
        if (!escopos.includes(escopo)) {
          recusar(res, 403, `sem o escopo ${escopo}`);
          return;
        }
        req.servico = { clientId, escopos };
        next();
      })().catch((erro: unknown) => {
        if (erro instanceof errors.JOSEError) {
          recusar(res, 401, erro.code);
          return;
        }
        next(erro);
      });
    };
  }

  return { obterTokenDeServico, esquecerTokenDeServico, exigirServico };
}
