import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CAMINHOS, RETORNO, type UsuarioPortao } from "../comum/tipos.js";

export { CAMINHOS, RETORNO, ehPapel, type Papel, type UsuarioPortao } from "../comum/tipos.js";

export type EstadoDaSessao =
  | { tipo: "carregando" }
  | { tipo: "logado"; usuario: UsuarioPortao }
  /** O Portão recusou: o papel não tem acesso a este app. */
  | { tipo: "sem-acesso" }
  /** O login voltou com erro (ex.: demorou mais de 10 min). */
  | { tipo: "erro" };

export interface Sessao {
  estado: EstadoDaSessao;
  /** Atalho: o usuário quando logado, `null` nos outros estados. */
  usuario: UsuarioPortao | null;
  carregando: boolean;
  /** Sai deste app e do Portão (e, com ele, dos outros apps). */
  sair(): Promise<void>;
  /** Vai ao Portão entrar de novo (ex.: botão "tentar de novo" na tela de erro). */
  entrar(): void;
}

const Contexto = createContext<Sessao | null>(null);

function caminhoAtual(): string {
  const url = new URL(window.location.href);
  url.searchParams.delete("portao");
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Navega ao Portão para entrar e voltar a este mesmo caminho. */
export function redirecionarParaLogin(voltar: string = caminhoAtual()): void {
  window.location.assign(`${CAMINHOS.entrar}?voltar=${encodeURIComponent(voltar)}`);
}

/** `fetch` do app: em 401 (sessão vencida) vai ao Portão renovar e volta. */
export async function fetchComPortao(entrada: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const resposta = await fetch(entrada, { credentials: "same-origin", ...init });
  if (resposta.status === 401) redirecionarParaLogin();
  return resposta;
}

interface PropsProvider {
  children: ReactNode;
}

/**
 * Envolve o app. Pergunta ao backend do próprio app quem está logado (`/api/portao/eu`);
 * sem sessão, vai ao Portão (que, com a sessão dele viva, volta sem mostrar tela nenhuma).
 */
export function PortaoProvider({ children }: PropsProvider) {
  const [estado, setEstado] = useState<EstadoDaSessao>({ tipo: "carregando" });

  useEffect(() => {
    const retorno = new URLSearchParams(window.location.search).get("portao");
    if (retorno === RETORNO.semAcesso) return setEstado({ tipo: "sem-acesso" });
    if (retorno === RETORNO.erro) return setEstado({ tipo: "erro" });

    let ativo = true;
    fetch(CAMINHOS.eu, { credentials: "same-origin" })
      .then(async (r) => {
        if (!ativo) return;
        if (r.status === 401) return redirecionarParaLogin();
        if (!r.ok) return setEstado({ tipo: "erro" });
        const { usuario } = (await r.json()) as { usuario: UsuarioPortao };
        setEstado({ tipo: "logado", usuario });
      })
      .catch(() => ativo && setEstado({ tipo: "erro" }));
    return () => {
      ativo = false;
    };
  }, []);

  const sair = useCallback(async () => {
    const r = await fetch(CAMINHOS.sair, { method: "POST", credentials: "same-origin" });
    const { url } = (await r.json().catch(() => ({ url: "/" }))) as { url?: string };
    window.location.assign(url ?? "/");
  }, []);

  const entrar = useCallback(() => redirecionarParaLogin(), []);

  const valor = useMemo<Sessao>(
    () => ({
      estado,
      usuario: estado.tipo === "logado" ? estado.usuario : null,
      carregando: estado.tipo === "carregando",
      sair,
      entrar,
    }),
    [estado, sair, entrar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSessao(): Sessao {
  const sessao = useContext(Contexto);
  if (!sessao) throw new Error("useSessao precisa estar dentro de <PortaoProvider>");
  return sessao;
}
