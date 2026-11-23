import { Router, RequestHandler } from 'express';

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

/** Escopo do Contrato de Feed: o único escopo de máquina do Portão hoje. */
declare const ESCOPO_FEED = "feed:read";
/** Quem chamou uma rota protegida por `exigirServico` (em `req.servico`). */
interface ServicoPortao {
    /** client_id de quem pediu o token (ex.: o client do CG). */
    clientId: string;
    escopos: string[];
}
/** O Portão recusou emitir o token de serviço (ex.: `invalid_target`, `unauthorized_client`). */
declare class ErroTokenDeServico extends Error {
    readonly recurso: string;
    /** Código OAuth devolvido pelo Portão, ou null se a falha foi de rede/configuração. */
    readonly codigo: string | null;
    constructor(recurso: string, 
    /** Código OAuth devolvido pelo Portão, ou null se a falha foi de rede/configuração. */
    codigo: string | null, options?: {
        cause?: unknown;
    });
}

/** Uma sessão do app, guardada no banco do app (nunca em memória do processo em produção). */
interface SessaoGuardada {
    /** SHA-256 (hex) do token do cookie. O token em si nunca é guardado. */
    id: string;
    usuario: UsuarioPortao;
    /** `sid` da sessão do Portão (para o back-channel logout achar esta sessão). */
    sid: string | null;
    /** ID token do login, usado como `id_token_hint` ao sair. */
    idToken: string;
    criadaEm: Date;
    expiraEm: Date;
}
/** Onde o app guarda as sessões. Implementado pelo app (ex.: uma tabela no Prisma dele). */
interface ArmazenamentoDeSessoes {
    criar(sessao: SessaoGuardada): Promise<void>;
    buscar(id: string): Promise<SessaoGuardada | null>;
    apagar(id: string): Promise<void>;
    /** Back-channel com `sid`: apaga as sessões daquele login no Portão. Devolve quantas apagou. */
    apagarPorSid(sid: string): Promise<number>;
    /** Back-channel só com `sub`: apaga todas as sessões do usuário. Devolve quantas apagou. */
    apagarPorUsuario(usuarioId: string): Promise<number>;
}
interface OpcoesPortao {
    /** Slug do app no Portão (ex.: "cineon"). Usado no nome do cookie e nos logs. */
    app: string;
    /** Issuer do Portão, ex.: "https://gate.gatourso.com/api/auth". */
    issuer: string;
    clientId: string;
    clientSecret: string;
    /** Origem pública do app, ex.: "https://cineon.gatourso.com" (em dev, "http://localhost:5174"). */
    urlDoApp: string;
    /**
     * Origem de PRODUÇÃO do app (ex.: "https://games.gatourso.com"): é o `aud` dos tokens de serviço
     * que `exigirServico` aceita, também em dev. Padrão: `urlDoApp` em produção; em dev, sem ela,
     * `exigirServico` lança erro. Só precisa para apps que expõem feed.
     */
    recurso?: string;
    /** Segredo do app (32+ caracteres) para cifrar o cookie temporário do login. */
    segredo: string;
    armazenamento: ArmazenamentoDeSessoes;
    /** Janela da sessão do app, em horas. Ao vencer, renova por redirect silencioso ao Portão. Padrão: 12. */
    janelaHoras?: number;
    /** Nome do cookie de sessão. Padrão: "<app>.sessao" (único por app: em dev os localhost dividem cookies). */
    nomeCookie?: string;
    /** Cookies `Secure` e travas de produção. Padrão: NODE_ENV === "production". */
    producao?: boolean;
    /**
     * Modo dev: aceita o cabeçalho `X-Dev-Papel: CAT|BEAR` sem login.
     * Proibido em produção (criarPortao lança erro).
     */
    modoDev?: boolean;
    /** Para logs (padrão: console). Nunca recebe senha, token ou código. */
    log?: (nivel: "info" | "warn" | "error", mensagem: string) => void;
}
declare global {
    namespace Express {
        interface Request {
            /** Usuário logado pelo Portão; definido por `lerSessao`/`exigirLogin`. */
            usuario?: UsuarioPortao;
            /** Quem chamou com token de serviço; definido por `exigirServico`. */
            servico?: ServicoPortao;
        }
    }
}

interface Portao {
    /** Rotas /api/portao/*: montar no app com `app.use(portao.router)`. */
    router: Router;
    /** Lê a sessão (se houver) e preenche `req.usuario`. Nunca bloqueia. */
    lerSessao: RequestHandler;
    /** Exige login: sem sessão, navegação vai ao Portão; chamada de API recebe 401. */
    exigirLogin: RequestHandler;
    /**
     * App que EXPÕE feed: exige token de serviço do Portão com o escopo (padrão "feed:read").
     * Montar antes do `exigirLogin`. Precisa de `recurso` (origem de produção) fora de produção.
     */
    exigirServico: (escopo?: string) => RequestHandler;
    /**
     * App que LÊ feed (o CG): token de serviço para chamar `recurso` (origem de PRODUÇÃO do app
     * chamado, mesmo em dev). Fica em memória até 1 min antes de vencer. Lança `ErroTokenDeServico`.
     */
    obterTokenDeServico: (recurso: string, escopo?: string) => Promise<string>;
    /** Descarta o token guardado para `recurso` (ex.: o app chamado respondeu 401). */
    esquecerTokenDeServico: (recurso: string, escopo?: string) => void;
}
declare function criarPortao(op: OpcoesPortao): Portao;
/** Restringe uma rota a certos papéis (depois de `exigirLogin`). */
declare function exigirPapel(...papeis: Papel[]): RequestHandler;

/**
 * Armazenamento em memória, SÓ para testes e protótipos.
 * Em produção, as sessões ficam no banco do app (reiniciar o processo não pode ressuscitar
 * sessões encerradas pelo back-channel, nem derrubar todo mundo).
 */
declare function armazenamentoEmMemoriaSoParaTestes(): ArmazenamentoDeSessoes & {
    tamanho(): number;
};

export { CAMINHOS, ESCOPO_FEED, ErroTokenDeServico, RETORNO, armazenamentoEmMemoriaSoParaTestes, criarPortao, ehPapel, exigirPapel };
export type { ArmazenamentoDeSessoes, OpcoesPortao, Papel, Portao, ServicoPortao, SessaoGuardada, UsuarioPortao };
