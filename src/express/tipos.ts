import type { UsuarioPortao } from "../comum/tipos.js";

/** Uma sessão do app, guardada no banco do app (nunca em memória do processo em produção). */
export interface SessaoGuardada {
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
export interface ArmazenamentoDeSessoes {
  criar(sessao: SessaoGuardada): Promise<void>;
  buscar(id: string): Promise<SessaoGuardada | null>;
  apagar(id: string): Promise<void>;
  /** Back-channel com `sid`: apaga as sessões daquele login no Portão. Devolve quantas apagou. */
  apagarPorSid(sid: string): Promise<number>;
  /** Back-channel só com `sub`: apaga todas as sessões do usuário. Devolve quantas apagou. */
  apagarPorUsuario(usuarioId: string): Promise<number>;
}

export interface OpcoesPortao {
  /** Slug do app no Portão (ex.: "cineon"). Usado no nome do cookie e nos logs. */
  app: string;
  /** Issuer do Portão, ex.: "https://gate.gatourso.com/api/auth". */
  issuer: string;
  clientId: string;
  clientSecret: string;
  /** Origem pública do app, ex.: "https://cineon.gatourso.com" (em dev, "http://localhost:5174"). */
  urlDoApp: string;
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
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Usuário logado pelo Portão; definido por `lerSessao`/`exigirLogin`. */
      usuario?: UsuarioPortao;
    }
  }
}
