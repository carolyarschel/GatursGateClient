// Estado do login em andamento (state, nonce, PKCE, voltar), num cookie cifrado de 10 minutos.
// Cifrado com JWE (jose), não à mão: dir + A256GCM, chave derivada do segredo do app.
import { createHash } from "node:crypto";
import { EncryptJWT, jwtDecrypt } from "jose";

export interface TransacaoDeLogin {
  state: string;
  nonce: string;
  codeVerifier: string;
  voltar: string;
}

export const VALIDADE_TRANSACAO_MS = 10 * 60 * 1000;

function chave(segredo: string): Uint8Array {
  return new Uint8Array(createHash("sha256").update(`gatur-portao-client:transacao:${segredo}`).digest());
}

export async function cifrarTransacao(t: TransacaoDeLogin, segredo: string): Promise<string> {
  return new EncryptJWT({ ...t })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${VALIDADE_TRANSACAO_MS / 1000}s`)
    .encrypt(chave(segredo));
}

/** Devolve a transação, ou `null` se o cookie faltar, estiver vencido ou adulterado. */
export async function decifrarTransacao(valor: string | undefined, segredo: string): Promise<TransacaoDeLogin | null> {
  if (!valor) return null;
  try {
    const { payload } = await jwtDecrypt(valor, chave(segredo));
    const { state, nonce, codeVerifier, voltar } = payload as Record<string, unknown>;
    if (typeof state !== "string" || typeof nonce !== "string" || typeof codeVerifier !== "string" || typeof voltar !== "string") {
      return null;
    }
    return { state, nonce, codeVerifier, voltar };
  } catch {
    return null;
  }
}
