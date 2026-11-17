export type Papel = "CAT" | "BEAR";

/** Quem está logado, como o Portão informa no ID token. Identificar pessoas sempre por `id` (o `sub`) ou `papel`. */
export interface UsuarioPortao {
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
export const CAMINHOS = {
  base: "/api/portao",
  entrar: "/api/portao/entrar",
  callback: "/api/portao/callback",
  sair: "/api/portao/sair",
  backchannelLogout: "/api/portao/backchannel-logout",
  eu: "/api/portao/eu",
} as const;

/** Valor de `?portao=` que o backend põe na URL do app ao voltar de um login que não deu certo. */
export const RETORNO = {
  semAcesso: "sem-acesso",
  erro: "erro",
} as const;

export function ehPapel(valor: unknown): valor is Papel {
  return valor === "CAT" || valor === "BEAR";
}
