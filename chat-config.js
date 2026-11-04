/* Public routing only. NEVER put an API key, session secret or Turnstile secret here.
   After deploying workers/chat, set endpoint to its HTTPS origin + /api/chat.
   The loopback default is only for `npm run chat:dev` on your own computer. */
globalThis.StillwaterChatConfig = Object.freeze({
  endpoint: ['localhost','127.0.0.1'].includes(location.hostname) ? 'http://127.0.0.1:8787/api/chat' : 'https://damp-rain-a5a6.ywang254.workers.dev/api/chat',
  turnstileSiteKey: '',
  serviceName: 'Stillwater AI Chat',
});
