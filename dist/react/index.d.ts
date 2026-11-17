import * as react from 'react';
import { ReactNode } from 'react';

type Papel = "CAT" | "BEAR";
/** Quem está logado, como o Portão informa no ID token. Identificar pessoas sempre por `id` (o `sub`) ou `papel`. */
interface UsuarioPortao {
    /** `sub` do Portão: id estável do usuário. */
    id: string;
    papel: Papel;
    /** "gato" | "urso" */
    username: string | null;
    nome: string;
    apelido: string | null;
    /** Cor do perfil em hex (#rrggbb). */
    cor: string | null;
}
/** Rotas que o pacote monta no backend do app (iguais ao CAMINHOS_DO_APP do Portão). */
declare const CAMINHOS: {
    readonly base: "/api/portao";
    readonly entrar: "/api/portao/entrar";
    readonly callback: "/api/portao/callback";
    readonly sair: "/api/portao/sair";
    readonly backchannelLogout: "/api/portao/backchannel-logout";
    readonly eu: "/api/portao/eu";
};
/** Valor de `?portao=` que o backend põe na URL do app ao voltar de um login que não deu certo. */
declare const RETORNO: {
    readonly semAcesso: "sem-acesso";
    readonly erro: "erro";
};
declare function ehPapel(valor: unknown): valor is Papel;

type EstadoDaSessao = {
    tipo: "carregando";
} | {
    tipo: "logado";
    usuario: UsuarioPortao;
}
/** O Portão recusou: o papel não tem acesso a este app. */
 | {
    tipo: "sem-acesso";
}
/** O login voltou com erro (ex.: demorou mais de 10 min). */
 | {
    tipo: "erro";
};
interface Sessao {
    estado: EstadoDaSessao;
    /** Atalho: o usuário quando logado, `null` nos outros estados. */
    usuario: UsuarioPortao | null;
    carregando: boolean;
    /** Sai deste app e do Portão (e, com ele, dos outros apps). */
    sair(): Promise<void>;
    /** Vai ao Portão entrar de novo (ex.: botão "tentar de novo" na tela de erro). */
    entrar(): void;
}
/** Navega ao Portão para entrar e voltar a este mesmo caminho. */
declare function redirecionarParaLogin(voltar?: string): void;
/** `fetch` do app: em 401 (sessão vencida) vai ao Portão renovar e volta. */
declare function fetchComPortao(entrada: RequestInfo | URL, init?: RequestInit): Promise<Response>;
interface PropsProvider {
    children: ReactNode;
}
/**
 * Envolve o app. Pergunta ao backend do próprio app quem está logado (`/api/portao/eu`);
 * sem sessão, vai ao Portão (que, com a sessão dele viva, volta sem mostrar tela nenhuma).
 */
declare function PortaoProvider({ children }: PropsProvider): react.JSX.Element;
declare function useSessao(): Sessao;

export { CAMINHOS, PortaoProvider, RETORNO, ehPapel, fetchComPortao, redirecionarParaLogin, useSessao };
export type { EstadoDaSessao, Papel, Sessao, UsuarioPortao };
