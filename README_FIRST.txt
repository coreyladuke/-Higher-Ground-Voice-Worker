HIGHER GROUND - CLOUDFARE VOICE WORKER - DEPLOY FROM GITHUB

Do not try to select and paste 3,000 characters into the Cloudflare editor on an iPhone. The Worker editor on mobile has known Select All / paste limitations.

1. Keep the already-created Cloudflare Worker higher-ground-voice-test. Do NOT delete it.
2. Create a new GitHub repository for BACKEND CODE ONLY, e.g. Higher-Ground-Voice-Worker. Public is fine for this code, but do NOT add API credentials or personal conversations.
3. Extract the ZIP in your iPhone Files app, then upload only voice-worker.mjs and wrangler.toml (NOT the ZIP or this README) to the root of that new repository; commit them.
4. In Cloudflare dashboard, open Workers & Pages > higher-ground-voice-test > Settings > Builds > Connect. Authorize GitHub and select this new repo. Production branch main, root directory / (root), deploy command npx wrangler deploy. The Cloudflare Worker name and wrangler.toml name must match exactly.
5. In Worker Settings > Bindings add Workers AI binding named AI. Under Variables and Secrets add secret HG_VOICE_TOKEN of 24+ random characters. Do not share or commit the value.
6. The existing test page transcribe-check.html must still be added to the GitHub Pages website. Set the private code and worker URL in that page to test, after user explicitly consents to send audio.

The source implements a single small prototype speech-to-text endpoint: POST /v1/transcribe and GET /health, requires GitHub Pages origin and a private test code, and has a 3.5 MB audio cap. No live Cloudflare inference has been tested yet. Do not expose your secret to anyone.
