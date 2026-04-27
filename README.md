# someone.help

> An anonymous AI to talk to when you just need someone.

A single-page, no-signup, no-tracking AI companion. Built because sometimes you don't need therapy, you don't need a coach, you don't need a productivity assistant — you just need someone to listen and chat back.

## What it is

- **One page.** No accounts. No model picker. No history sidebar. Just a chat box.
- **Anonymous by design.** No email, no IP logging on our side, no server-side conversation storage.
- **Conversation lives only in your browser.** Close the tab and it's gone forever.
- **Honest about what it isn't.** Crisis resources are always one click away. We're not therapy.

## How it works

```
Browser  →  edge / reverse proxy (as you configure it)
         →  Next.js app (no IP logging in app code; anon UUID in localStorage)
         →  Together AI (Llama 3.3 70B-class model, per their policy)
```

Privacy posture is documented on `/about`.

## Stack

- Next.js (App Router) + React 19
- Vercel AI SDK + `@ai-sdk/togetherai`
- Tailwind CSS v4
- TypeScript
- Docker deploy (any host)
- Optional aggregate page analytics — configure via env on your server only (see `.env.example`)

## Local dev

```bash
cp .env.example .env.local
# set TOGETHER_API_KEY (from Together AI)
npm install
npm run dev
```

## Deploy

Push to your default branch. Configure env vars in your host’s UI:

| Var | Notes |
|---|---|
| `TOGETHER_API_KEY` | Required — from [Together AI](https://api.together.ai) |
| `TOGETHER_MODEL` | Optional — default `meta-llama/Llama-3.3-70B-Instruct-Turbo` |
| `TRUST_CLOUDFLARE` | Optional — if you terminate TLS at Cloudflare |

See `.env.example` for public/analytics vars.

## License

MIT — open it under the hood, that's the whole point.
