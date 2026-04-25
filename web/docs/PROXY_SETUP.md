# Gemini proxy — keeping the API key off the client

The web app calls Google's Gemini API through a tiny Vercel serverless
function so the API key never ships in the JS bundle. This doc explains how
the pieces fit together and what you need to configure.

## Files involved

| File | Purpose |
|------|---------|
| `web/api/gemini.js` | Vercel serverless function. Receives `POST` requests from the client, attaches `GEMINI_API_KEY` server-side, and forwards to `generativelanguage.googleapis.com`. |
| `web/vercel.json` | Build config (`expo export -p web` → `dist/`) plus an SPA rewrite that routes everything **except** `/api/*` to `index.html`. |
| `web/src/services/aiService.js` | Client. Posts to `${EXPO_PUBLIC_API_BASE}/api/gemini` (empty base on web → relative same-origin URL). Never imports `GEMINI_API_KEY`. |
| `web/src/config/supabase.js` | Reads `EXPO_PUBLIC_SUPABASE_*` first (Vercel-friendly), falls back to `@env` for local Expo dev. |
| `web/.env.example` | Template showing every env var the project understands. |

## Vercel project settings

Set the **Root Directory** to `web` (the React Native app, the proxy, and
`vercel.json` all live there). Then add these Environment Variables under
*Project → Settings → Environment Variables*:

| Variable | Scope | Notes |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | client | Baked into the JS bundle at build time. Public by design. |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | client | Public anon key. Protect data with Supabase Row-Level Security. |
| `GEMINI_API_KEY` | **server only** | No `EXPO_PUBLIC_` prefix — Expo will not bake it into the bundle. Only `web/api/gemini.js` reads it. |

## Request flow

```
Browser  ──POST /api/gemini──►  Vercel function (web/api/gemini.js)
                                       │ reads process.env.GEMINI_API_KEY
                                       ▼
                                generativelanguage.googleapis.com
                                       │
                                       ▼
Browser  ◄──── JSON response ──── Vercel function
```

The Gemini key is held in Vercel's runtime environment. Anyone inspecting
the network tab or the JS bundle won't find it.

## Native (Android / iOS) shells

Both shells are thin WebViews that load the deployed Vercel URL (see
`README.md` at the repo root). Because the page they load is the same
origin that hosts `/api/gemini`, the relative URL in `aiService.js` works
out of the box — no native configuration needed for the proxy.

## Local development

The web dev server (`npm run web`) does **not** run the Vercel function.
Two options:

1. **Use `vercel dev`** from the `web/` directory — serves the static export
   and the function together, auto-loading `web/.env`.
2. **Hit the deployed proxy** by setting `EXPO_PUBLIC_API_BASE` in
   `web/.env` to your Vercel URL (e.g. `https://whatoeat.vercel.app`); then
   `npm run web` calls the live proxy.
