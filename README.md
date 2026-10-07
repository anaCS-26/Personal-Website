# Personal portfolio + AsadGPT

My personal portfolio site. The centerpiece is **AsadGPT**, a live AI assistant
grounded in my real experience. Ask it anything about my projects, internships,
or skills and it answers with working links into the site.

## How AsadGPT works

- **No RAG, no vector DB**: my facts are small enough to live in a single
  knowledge file (`knowledge/about-me.md`) injected into the system prompt.
  Simpler, cheaper, and more accurate at this scale.
- **Model**: Claude Haiku 5.5 via `@anthropic-ai/sdk`, streamed from a Next.js
  Route Handler (`app/api/chat/route.ts`) so the API key stays server-side.
- **Honest by design**: it only states facts from the knowledge file; anything
  else gets "you'd have to ask Asad directly."
- **Public-safe**: per-IP rate limiting + a global daily budget (Upstash Redis,
  with an in-memory fallback), input clamping, prompt-injection guardrails, and
  graceful fallbacks when the API is down.
- **Fluid UX**: typewriter streaming, voice input (Web Speech API), suggestion
  chips, and a conversation that resets when you leave the chat.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Claude API ·
Upstash Redis · deployed on Vercel

## Running locally

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Optional: add Upstash Redis credentials in `.env.local` for real rate limiting
(falls back to per-instance in-memory limits without them).

## Content

- `knowledge/about-me.md`: the assistant's single source of truth
- `lib/content.ts`: structured content for the site sections
- `lib/system-prompt.ts`: AsadGPT's persona and guardrails
