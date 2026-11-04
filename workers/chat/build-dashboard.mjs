import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
await build({entryPoints:[fileURLToPath(new URL('./dashboard/entry.mjs',import.meta.url))],outfile:fileURLToPath(new URL('./dashboard/worker.js',import.meta.url)),bundle:true,format:'esm',platform:'browser',target:'es2022',minify:false,banner:{js:'/* STILLWATER CHAT 4.10.0 — Cloudflare Edit code edition.\n   Paste THIS WHOLE FILE into worker.js (replace Hello World).\n   Required: D1 binding CHAT_DB; schema.sql applied; secrets OPENAI_API_KEY + SESSION_SECRET.\n   Public vars: CHAT_MODE=live; ALLOWED_ORIGINS=https://rieyekiwong.github.io.\n   No npm install, import, Durable Object migration or API key belongs in the pasted code. */'}});
console.log('Built dashboard/worker.js (standalone ES module).');
