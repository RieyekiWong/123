# Stillwater Chat Worker

Deploys to the existing **damp-rain-a5a6**. Read [the complete Chinese setup guide](../../docs/V2_10-AI-CHAT.zh-CN.md).

```sh
npm ci
npx wrangler login
npm run secret:session
npm run deploy
node smoke.mjs
```

Keep the existing `OPENAI_API_KEY` Cloudflare Secret. `secret:session` generates and uploads a separate `SESSION_SECRET` without echoing or writing it to disk. No key belongs in the frontend or Git. Deployment creates the `ChatBudget` Durable Object; copying a JS snippet into the dashboard alone is not equivalent.

`npm run dev` explicitly uses **mock** mode locally (no OpenAI key). Production configuration uses **live** mode. `node smoke.mjs` makes four real, short OpenAI requests and must print PASS to confirm the live integration. A health response or local mock test does not prove real inference works.

Optional Turnstile: configure `TURNSTILE_SECRET` as a Worker Secret, public site key in `chat-config.js`, and `REQUIRE_TURNSTILE=true`. Otherwise anonymous sessions remain strictly capped by the persistent per-IP/session/global budget.
