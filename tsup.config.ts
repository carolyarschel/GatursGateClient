import { defineConfig } from "tsup";

// openid-client, oauth4webapi e jose só existem como ESM: entram embutidos no build,
// para o pacote funcionar também em backends CommonJS (como o do Cineon).
const embutir = ["openid-client", "oauth4webapi", "jose"];

export default defineConfig([
  {
    entry: { "express/index": "src/express/index.ts" },
    format: ["esm", "cjs"],
    platform: "node",
    target: "node20",
    dts: true,
    clean: true,
    sourcemap: true,
    external: ["express"],
    noExternal: embutir,
  },
  {
    entry: { "react/index": "src/react/index.tsx" },
    format: ["esm"],
    platform: "browser",
    target: "es2022",
    dts: true,
    sourcemap: true,
    external: ["react", "react/jsx-runtime"],
  },
]);
