import type { ArmazenamentoDeSessoes, SessaoGuardada } from "./tipos.js";

/**
 * Armazenamento em memória, SÓ para testes e protótipos.
 * Em produção, as sessões ficam no banco do app (reiniciar o processo não pode ressuscitar
 * sessões encerradas pelo back-channel, nem derrubar todo mundo).
 */
export function armazenamentoEmMemoriaSoParaTestes(): ArmazenamentoDeSessoes & { tamanho(): number } {
  const sessoes = new Map<string, SessaoGuardada>();
  const apagarSe = (cond: (s: SessaoGuardada) => boolean) => {
    let n = 0;
    for (const [id, s] of sessoes) if (cond(s) && sessoes.delete(id)) n++;
    return n;
  };
  return {
    async criar(s) {
      sessoes.set(s.id, s);
    },
    async buscar(id) {
      return sessoes.get(id) ?? null;
    },
    async apagar(id) {
      sessoes.delete(id);
    },
    async apagarPorSid(sid) {
      return apagarSe((s) => s.sid === sid);
    },
    async apagarPorUsuario(usuarioId) {
      return apagarSe((s) => s.usuario.id === usuarioId);
    },
    tamanho: () => sessoes.size,
  };
}
