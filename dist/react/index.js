// src/react/index.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// src/comum/tipos.ts
var CAMINHOS = {
  base: "/api/portao",
  entrar: "/api/portao/entrar",
  callback: "/api/portao/callback",
  sair: "/api/portao/sair",
  backchannelLogout: "/api/portao/backchannel-logout",
  eu: "/api/portao/eu"
};
var RETORNO = {
  semAcesso: "sem-acesso",
  erro: "erro"
};
function ehPapel(valor) {
  return valor === "CAT" || valor === "BEAR";
}

// src/react/index.tsx
import { jsx } from "react/jsx-runtime";
var Contexto = createContext(null);
function caminhoAtual() {
  const url = new URL(window.location.href);
  url.searchParams.delete("portao");
  return `${url.pathname}${url.search}${url.hash}`;
}
function redirecionarParaLogin(voltar = caminhoAtual()) {
  window.location.assign(`${CAMINHOS.entrar}?voltar=${encodeURIComponent(voltar)}`);
}
async function fetchComPortao(entrada, init) {
  const resposta = await fetch(entrada, { credentials: "same-origin", ...init });
  if (resposta.status === 401) redirecionarParaLogin();
  return resposta;
}
function PortaoProvider({ children }) {
  const [estado, setEstado] = useState({ tipo: "carregando" });
  useEffect(() => {
    const retorno = new URLSearchParams(window.location.search).get("portao");
    if (retorno === RETORNO.semAcesso) return setEstado({ tipo: "sem-acesso" });
    if (retorno === RETORNO.erro) return setEstado({ tipo: "erro" });
    let ativo = true;
    fetch(CAMINHOS.eu, { credentials: "same-origin" }).then(async (r) => {
      if (!ativo) return;
      if (r.status === 401) return redirecionarParaLogin();
      if (!r.ok) return setEstado({ tipo: "erro" });
      const { usuario } = await r.json();
      setEstado({ tipo: "logado", usuario });
    }).catch(() => ativo && setEstado({ tipo: "erro" }));
    return () => {
      ativo = false;
    };
  }, []);
  const sair = useCallback(async () => {
    const r = await fetch(CAMINHOS.sair, { method: "POST", credentials: "same-origin" });
    const { url } = await r.json().catch(() => ({ url: "/" }));
    window.location.assign(url ?? "/");
  }, []);
  const entrar = useCallback(() => redirecionarParaLogin(), []);
  const valor = useMemo(
    () => ({
      estado,
      usuario: estado.tipo === "logado" ? estado.usuario : null,
      carregando: estado.tipo === "carregando",
      sair,
      entrar
    }),
    [estado, sair, entrar]
  );
  return /* @__PURE__ */ jsx(Contexto.Provider, { value: valor, children });
}
function useSessao() {
  const sessao = useContext(Contexto);
  if (!sessao) throw new Error("useSessao precisa estar dentro de <PortaoProvider>");
  return sessao;
}
export {
  CAMINHOS,
  PortaoProvider,
  RETORNO,
  ehPapel,
  fetchComPortao,
  redirecionarParaLogin,
  useSessao
};
//# sourceMappingURL=index.js.map