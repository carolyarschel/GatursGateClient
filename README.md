# gatur-portao-client

Login pelo **Portão de Gatur** (OAuth 2.1 + OpenID Connect) para os apps do ecossistema `*.gatourso.com`.

- **Backend (Express):** o backend do app é o client OAuth (confidencial, PKCE). Ele troca o código por tokens e mantém a **própria sessão**, com cookie `httpOnly` do subdomínio do app. **Nenhum token chega ao navegador.**
- **Frontend (React):** `PortaoProvider` e `useSessao()` perguntam ao backend do próprio app quem está logado.

Contrato com o Portão (ver `claude.md` do Portão): sem refresh token. A sessão do app vale por uma janela (padrão **12 h**) e é renovada por um redirect silencioso ao Portão. "Sair" encerra a sessão do app e a do Portão. O back-channel logout derruba as sessões dos outros apps.

## Instalação

```bash
npm install https://github.com/carolyarschel/GatursGateClient/archive/refs/tags/v0.1.0.tar.gz
```
Use o **tarball HTTPS da tag**, não `github:usuario/repo`: com a forma curta o `package-lock.json` grava `git+ssh://`, e o `npm ci` do servidor (Catploy) falha sem chave SSH do GitHub. O tarball fica no lock com hash de integridade e não precisa de git.

O `dist/` é versionado: nada é compilado na instalação. O pacote funciona em backends **ESM e CommonJS** (o `openid-client`, que só existe como ESM, vai embutido no build). Requer Node 20.19+.

## Pré-requisito no Portão

Registrar o app e guardar o segredo (mostrado uma vez):

```bash
npm run app:registrar -- --slug cineon --nome Cineon --origem https://cineon.gatourso.com --origem-dev http://localhost:5174 --papeis CAT,BEAR --icone clapperboard --ativa
```

## Backend (Express)

```ts
import express from "express";
import { criarPortao, exigirPapel } from "gatur-portao-client/express";

const portao = criarPortao({
  app: "cineon",
  issuer: process.env.PORTAO_ISSUER!,            // https://gate.gatourso.com/api/auth
  clientId: process.env.PORTAO_CLIENT_ID!,
  clientSecret: process.env.PORTAO_CLIENT_SECRET!,
  urlDoApp: process.env.PORTAO_URL_DO_APP!,      // https://cineon.gatourso.com
  segredo: process.env.PORTAO_SEGREDO!,          // 32+ caracteres, só deste app
  armazenamento: minhasSessoes,                  // ver abaixo
  modoDev: process.env.PORTAO_DEV === "true",    // proibido em produção (lança erro)
});

app.use(portao.router);                          // monta /api/portao/*
app.use("/api", portao.exigirLogin);             // req.usuario: { id, papel, username, nome, apelido, cor }
app.get("/api/admin", exigirPapel("CAT"), handler);
```

Rotas montadas (todas sob `/api/portao`, porque no Catploy só `/api` chega ao backend):

| Rota | O quê |
|---|---|
| `GET /api/portao/entrar?voltar=/caminho` | Inicia o login (PKCE + state + nonce num cookie cifrado de 10 min). |
| `GET /api/portao/callback` | Troca o código, valida o ID token e cria a sessão. Em caso de recusa, volta com `/?portao=sem-acesso` ou `/?portao=erro`. |
| `GET /api/portao/eu` | `{ usuario, expiraEm }` ou `401`. |
| `POST /api/portao/sair` | Apaga a sessão do app e devolve `{ url }` do end-session do Portão. |
| `POST /api/portao/backchannel-logout` | Valida o logout token (EdDSA, `aud`, evento) e apaga as sessões daquele `sid`. |

`exigirLogin`: sem sessão, uma navegação (GET que aceita HTML) vai ao Portão, e uma chamada de API recebe `401`.

### Armazenamento das sessões

As sessões ficam **no banco do app**. O app implementa a interface `ArmazenamentoDeSessoes`: `criar`, `buscar`, `apagar`, `apagarPorSid` e `apagarPorUsuario`. Exemplo de tabela (Prisma):

```prisma
model PortaoSessao {
  id        String   @id            // SHA-256 do token do cookie (o token nunca é guardado)
  usuarioId String                  // sub do Portão
  usuario   Json                    // UsuarioPortao
  sid       String?
  idToken   String
  criadaEm  DateTime
  expiraEm  DateTime

  @@index([sid])
  @@index([usuarioId])
}
```

`armazenamentoEmMemoriaSoParaTestes()` existe só para testes.

## Frontend (React)

```tsx
import { PortaoProvider, useSessao, fetchComPortao } from "gatur-portao-client/react";

<PortaoProvider>
  <App />
</PortaoProvider>

function App() {
  const { estado, usuario, sair } = useSessao();
  if (estado.tipo === "carregando") return <Carregando />;
  if (estado.tipo === "sem-acesso") return <SemAcesso />;   // papel sem permissão neste app
  if (estado.tipo === "erro") return <ErroDeLogin />;
  return <Home usuario={usuario!} onSair={sair} />;
}

// chamadas de API: em 401 (janela vencida) renova pelo Portão e volta
const r = await fetchComPortao("/api/filmes");
```

## Variáveis de ambiente sugeridas no app

```
PORTAO_ISSUER=https://gate.gatourso.com/api/auth
PORTAO_CLIENT_ID=
PORTAO_CLIENT_SECRET=
PORTAO_URL_DO_APP=https://cineon.gatourso.com
PORTAO_SEGREDO=
PORTAO_DEV=false
```

Em dev: `PORTAO_ISSUER=http://localhost:5173/api/auth` (o Portão local pelo Vite) e `PORTAO_URL_DO_APP=http://localhost:5174`. Como os `localhost` dividem cookies, o cookie de sessão de cada app tem nome próprio (`<app>.sessao`).

## Desenvolvimento do pacote

```bash
npm install
npm run typecheck
npm run build   # tsup: ESM + CJS + tipos (usa TypeScript 6 só aqui, porque o tsup precisa da API de compilador)
```
