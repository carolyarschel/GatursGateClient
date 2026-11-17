import { createHash, randomBytes } from "node:crypto";
import { Router, urlencoded, type NextFunction, type Request, type RequestHandler, type Response } from "express";
import * as oidc from "openid-client";
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import { CAMINHOS, RETORNO, ehPapel, type Papel, type UsuarioPortao } from "../comum/tipos.js";
import { lerCookie, opcoes } from "./cookies.js";
import { cifrarTransacao, decifrarTransacao, VALIDADE_TRANSACAO_MS } from "./transacao.js";
import type { OpcoesPortao, SessaoGuardada } from "./tipos.js";

const EVENTO_BACKCHANNEL = "http://schemas.openid.net/event/backchannel-logout";

export interface Portao {
  /** Rotas /api/portao/*: montar no app com `app.use(portao.router)`. */
  router: Router;
  /** Lê a sessão (se houver) e preenche `req.usuario`. Nunca bloqueia. */
  lerSessao: RequestHandler;
  /** Exige login: sem sessão, navegação vai ao Portão; chamada de API recebe 401. */
  exigirLogin: RequestHandler;
}

/** Só caminhos relativos do próprio app (evita open redirect). */
function voltarSeguro(valor: unknown): string {
  if (typeof valor !== "string" || !valor.startsWith("/") || valor.startsWith("//") || valor.startsWith("/\\")) {
    return "/";
  }
  if (valor.startsWith(CAMINHOS.base)) return "/";
  return valor;
}

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function texto(valor: unknown): string | null {
  return typeof valor === "string" && valor.length > 0 ? valor : null;
}

/** Express 4 não captura rejeição de handler assíncrono; isto vale para os dois. */
function assincrono(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

function querNavegacao(req: Request): boolean {
  return req.method === "GET" && Boolean(req.accepts(["html", "json"]) === "html");
}

export function criarPortao(op: OpcoesPortao): Portao {
  const producao = op.producao ?? process.env.NODE_ENV === "production";
  const janelaMs = (op.janelaHoras ?? 12) * 60 * 60 * 1000;
  const nomeCookie = op.nomeCookie ?? `${op.app}.sessao`;
  const nomeTransacao = `${op.app}.login`;
  const urlDoApp = new URL(op.urlDoApp).origin;
  const log = op.log ?? ((nivel, msg) => console[nivel](`[portao:${op.app}] ${msg}`));

  if (op.modoDev && producao) {
    throw new Error("gatur-portao-client: modoDev (PORTAO_DEV) não pode ser ligado em produção");
  }
  if (!op.segredo || op.segredo.length < 32) {
    throw new Error("gatur-portao-client: `segredo` precisa de pelo menos 32 caracteres");
  }
  if (producao && (!urlDoApp.startsWith("https://") || !op.issuer.startsWith("https://"))) {
    throw new Error("gatur-portao-client: em produção, urlDoApp e issuer precisam ser https");
  }

  // ── Configuração OIDC (discovery preguiçoso, com nova tentativa se falhar) ──
  let configuracao: Promise<oidc.Configuration> | null = null;
  let jwks: JWTVerifyGetKey | null = null;

  function obterConfiguracao(): Promise<oidc.Configuration> {
    if (!configuracao) {
      const inseguro = new URL(op.issuer).protocol === "http:";
      configuracao = oidc
        .discovery(
          new URL(op.issuer),
          op.clientId,
          undefined,
          oidc.ClientSecretBasic(op.clientSecret),
          inseguro && !producao ? { execute: [oidc.allowInsecureRequests] } : undefined,
        )
        .catch((erro: unknown) => {
          configuracao = null;
          throw erro;
        });
    }
    return configuracao;
  }

  async function obterJwks(): Promise<JWTVerifyGetKey> {
    if (!jwks) {
      const jwksUri = (await obterConfiguracao()).serverMetadata().jwks_uri;
      if (!jwksUri) throw new Error("Portão sem jwks_uri no discovery");
      jwks = createRemoteJWKSet(new URL(jwksUri));
    }
    return jwks;
  }

  const cookieSessao = (maxAgeMs: number) => opcoes({ maxAgeMs, path: "/", secure: producao });
  const cookieTransacao = (maxAgeMs: number) => opcoes({ maxAgeMs, path: CAMINHOS.base, secure: producao });

  // ── Sessão ──
  async function sessaoDaRequisicao(req: Request): Promise<SessaoGuardada | null> {
    const token = lerCookie(req.headers.cookie, nomeCookie);
    if (!token) return null;
    const sessao = await op.armazenamento.buscar(hash(token));
    if (!sessao) return null;
    if (sessao.expiraEm.getTime() <= Date.now()) {
      await op.armazenamento.apagar(sessao.id);
      return null;
    }
    return sessao;
  }

  function usuarioDev(req: Request): UsuarioPortao | null {
    if (!op.modoDev) return null;
    const papel = req.get("x-dev-papel");
    if (!ehPapel(papel)) return null;
    const ehGato = papel === "CAT";
    return {
      id: `dev-${papel.toLowerCase()}`,
      papel,
      username: ehGato ? "gato" : "urso",
      nome: ehGato ? "Gato (dev)" : "Urso (dev)",
      apelido: null,
      cor: null,
    };
  }

  const lerSessao = assincrono(async (req, _res, next) => {
    const dev = usuarioDev(req);
    if (dev) {
      req.usuario = dev;
    } else {
      const sessao = await sessaoDaRequisicao(req);
      if (sessao) req.usuario = sessao.usuario;
    }
    next();
  });

  const exigirLogin = assincrono(async (req, res, next) => {
    if (!req.usuario) {
      const dev = usuarioDev(req);
      const sessao = dev ? null : await sessaoDaRequisicao(req);
      req.usuario = dev ?? sessao?.usuario;
    }
    if (req.usuario) return next();

    if (querNavegacao(req)) {
      res.redirect(`${CAMINHOS.entrar}?voltar=${encodeURIComponent(voltarSeguro(req.originalUrl))}`);
      return;
    }
    res.status(401).json({ erro: { codigo: "NAO_AUTENTICADO", mensagem: "Entre pelo Portão para continuar." } });
  });

  // ── Rotas ──
  const router = Router();

  router.get(
    CAMINHOS.entrar,
    assincrono(async (req, res) => {
      const config = await obterConfiguracao();
      const codeVerifier = oidc.randomPKCECodeVerifier();
      const state = oidc.randomState();
      const nonce = oidc.randomNonce();
      const voltar = voltarSeguro(req.query.voltar);

      res.cookie(
        nomeTransacao,
        await cifrarTransacao({ state, nonce, codeVerifier, voltar }, op.segredo),
        cookieTransacao(VALIDADE_TRANSACAO_MS),
      );

      const url = oidc.buildAuthorizationUrl(config, {
        redirect_uri: `${urlDoApp}${CAMINHOS.callback}`,
        scope: "openid profile",
        code_challenge: await oidc.calculatePKCECodeChallenge(codeVerifier),
        code_challenge_method: "S256",
        state,
        nonce,
      });
      res.redirect(url.href);
    }),
  );

  router.get(
    CAMINHOS.callback,
    assincrono(async (req, res) => {
      const transacao = await decifrarTransacao(lerCookie(req.headers.cookie, nomeTransacao), op.segredo);
      res.clearCookie(nomeTransacao, cookieTransacao(0));

      if (req.query.error === "access_denied") {
        log("info", "login recusado pelo Portão (papel sem acesso)");
        res.redirect(`/?portao=${RETORNO.semAcesso}`);
        return;
      }
      if (!transacao) {
        log("warn", "callback sem transação válida (cookie ausente ou vencido)");
        res.redirect(`/?portao=${RETORNO.erro}`);
        return;
      }

      const config = await obterConfiguracao();
      let tokens: Awaited<ReturnType<typeof oidc.authorizationCodeGrant>>;
      try {
        tokens = await oidc.authorizationCodeGrant(config, new URL(req.originalUrl, urlDoApp), {
          pkceCodeVerifier: transacao.codeVerifier,
          expectedState: transacao.state,
          expectedNonce: transacao.nonce,
          idTokenExpected: true,
        });
      } catch (erro) {
        const codigo = (erro as { error?: unknown }).error;
        log("warn", `troca do código falhou: ${typeof codigo === "string" ? codigo : (erro as Error).name}`);
        res.redirect(`/?portao=${codigo === "access_denied" ? RETORNO.semAcesso : RETORNO.erro}`);
        return;
      }

      const claims = tokens.claims();
      const papel = claims?.papel;
      if (!claims || !tokens.id_token || !ehPapel(papel)) {
        log("error", "ID token sem claims esperadas (papel)");
        res.redirect(`/?portao=${RETORNO.erro}`);
        return;
      }

      const usuario: UsuarioPortao = {
        id: claims.sub,
        papel: papel as Papel,
        username: texto(claims.preferred_username),
        nome: texto(claims.name) ?? texto(claims.preferred_username) ?? papel,
        apelido: texto(claims.apelido),
        cor: texto(claims.cor),
      };

      const token = randomBytes(32).toString("base64url");
      const agora = new Date();
      await op.armazenamento.criar({
        id: hash(token),
        usuario,
        sid: texto(claims.sid),
        idToken: tokens.id_token,
        criadaEm: agora,
        expiraEm: new Date(agora.getTime() + janelaMs),
      });

      res.cookie(nomeCookie, token, cookieSessao(janelaMs));
      log("info", `login ok (papel ${usuario.papel})`);
      res.redirect(transacao.voltar);
    }),
  );

  router.get(
    CAMINHOS.eu,
    assincrono(async (req, res) => {
      const dev = usuarioDev(req);
      if (dev) {
        res.json({ usuario: dev, expiraEm: null });
        return;
      }
      const sessao = await sessaoDaRequisicao(req);
      if (!sessao) {
        res.status(401).json({ erro: { codigo: "NAO_AUTENTICADO", mensagem: "Entre pelo Portão para continuar." } });
        return;
      }
      res.json({ usuario: sessao.usuario, expiraEm: sessao.expiraEm.toISOString() });
    }),
  );

  // Sair: apaga a sessão do app e devolve a URL do end-session do Portão (o frontend navega até lá).
  router.post(
    CAMINHOS.sair,
    assincrono(async (req, res) => {
      const sessao = await sessaoDaRequisicao(req);
      res.clearCookie(nomeCookie, cookieSessao(0));
      if (!sessao) {
        res.json({ url: "/" });
        return;
      }
      await op.armazenamento.apagar(sessao.id);
      const config = await obterConfiguracao();
      const url = oidc.buildEndSessionUrl(config, {
        id_token_hint: sessao.idToken,
        post_logout_redirect_uri: `${urlDoApp}/`,
        client_id: op.clientId,
      });
      res.json({ url: url.href });
    }),
  );

  // Back-channel logout (OIDC): o Portão avisa que uma sessão dele terminou.
  router.post(
    CAMINHOS.backchannelLogout,
    urlencoded({ extended: false, limit: "16kb" }),
    assincrono(async (req, res) => {
      const logoutToken = (req.body as Record<string, unknown> | undefined)?.logout_token;
      if (typeof logoutToken !== "string") {
        res.status(400).json({ error: "invalid_request" });
        return;
      }

      try {
        const config = await obterConfiguracao();
        const { payload } = await jwtVerify(logoutToken, await obterJwks(), {
          issuer: config.serverMetadata().issuer,
          audience: op.clientId,
          typ: "logout+jwt",
          maxTokenAge: "2m",
        });
        const eventos = payload.events as Record<string, unknown> | undefined;
        if (!eventos || typeof eventos[EVENTO_BACKCHANNEL] !== "object" || "nonce" in payload) {
          throw new Error("logout token sem o evento de back-channel");
        }
        const sid = texto(payload.sid);
        const sub = texto(payload.sub);
        if (!sid && !sub) throw new Error("logout token sem sid nem sub");

        const apagadas = sid ? await op.armazenamento.apagarPorSid(sid) : await op.armazenamento.apagarPorUsuario(sub!);
        log("info", `back-channel logout: ${apagadas} sessão(ões) encerrada(s)`);
        res.setHeader("Cache-Control", "no-store");
        res.status(200).end();
      } catch (erro) {
        log("warn", `back-channel logout recusado: ${(erro as Error).message}`);
        res.status(400).json({ error: "invalid_request" });
      }
    }),
  );

  return { router, lerSessao, exigirLogin };
}

/** Restringe uma rota a certos papéis (depois de `exigirLogin`). */
export function exigirPapel(...papeis: Papel[]): RequestHandler {
  return (req, res, next) => {
    if (req.usuario && papeis.includes(req.usuario.papel)) return next();
    res.status(403).json({ erro: { codigo: "SEM_PERMISSAO", mensagem: "Seu perfil não tem acesso a isto." } });
  };
}
