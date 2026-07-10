# Founder English OS

A private, voice-first English speaking coach for a Spanish entrepreneur who
wants to speak clearly, naturally, calmly and confidently in real business
situations — networking, meetings, pitches, public speaking, AI conversations,
marketing, automation and founder communication.

The goal is **not academic English**. It's real, confident speaking. The app
feels like a private training room, not a school app.

## What's inside

| Page | What it does |
| --- | --- |
| **Dashboard** | Daily streak, sessions completed, current level, top repeated mistakes, phrases learned, next recommended practice. |
| **Learn** | A founder-focused curriculum of short lessons. Each teaches a skill in Spanish, gives key phrases (EN/ES) with audio, and drills you with guided prompts the coach checks — then tracks which lessons you've completed. |
| **Practice Room** | The main screen. Pick a scenario, then speak (voice) or type. After every answer the coach returns the main mistake, a natural version, a stronger founder-level version, a pronunciation/rhythm tip, a communication tip, a line to repeat out loud, and a Spanish explanation. Save any mistake or phrase in one tap. |
| **Scenario Library** | Ten real founder situations, from warm-up to challenge. |
| **Error Log** | Every saved mistake: what you said, the correction, an explanation in Spanish, an example, the date and the scenario. |
| **Phrase Bank** | Phrases you own — English, Spanish meaning, when to use it, an example, and a confidence level (shaky → solid). |
| **Progress** | Seven skills scored 1–10 after each session: fluency, clarity, grammar, vocabulary, pronunciation, confidence and founder presence — with a trend line and full session history. |

## The coach

During practice the coach speaks in **simple, natural English** and explains the
important corrections in **Spanish**. It corrects only the single most important
mistake per answer, stays calm and encouraging, and keeps the roleplay going.

- **With an Anthropic API key**, the coach is powered by Claude via the
  `/api/ai` endpoint on the app's own Node server.
- **Without one**, a built-in local coach catches the most common
  Spanish→English speaking mistakes so the app is fully usable offline.

## Voice

Voice-first, with a text fallback everywhere:

- **Speak** — browser Speech Recognition (`en-US`). Works best in Chrome / Edge.
- **Listen** — the coach reads its replies and corrections aloud via Speech
  Synthesis, at a calm pace. Toggle it off any time.
- **Type** — every answer can be typed instead. No microphone required.

## Data & storage

The app is **local-first**: everything is saved to your browser
(`localStorage`), so it works with zero configuration.

Optional cloud backup uses **Supabase**. It's a private, single-user app —
there is no login screen. When Supabase is configured the app signs in
anonymously and scopes every row to that user via Row Level Security.

Tables (see [`supabase/schema.sql`](supabase/schema.sql)):
`user_profile`, `scenarios`, `sessions`, `mistakes`, `phrases`, `scores`.

### Environment variables

Copy `.env.example` to `.env` and fill in what you need (all optional):

```
ANTHROPIC_API_KEY=...          # server /api/ai — enables the Claude coach
COACH_MODEL=claude-haiku-4-5-20251001
PORT=8787                      # server port
VITE_SUPABASE_URL=...          # frontend — Supabase project URL
VITE_SUPABASE_ANON_KEY=...     # frontend — Supabase anon key
```

To enable cloud backup: run `supabase/schema.sql` in the Supabase SQL editor,
then turn on **Anonymous sign-ins** in Authentication → Providers.

## Run locally

```bash
npm install
npm run dev        # frontend only, http://localhost:5173 (local coach)
npm start          # run the Node server on :8787 (enables the Claude coach)
```

In dev, Vite proxies `/api` to the Node server on `:8787`, so run `npm start`
in a second terminal if you want the real Claude coach while developing.

## Deploy — self-hosted

One Node process serves the built frontend **and** the AI coach API. No Vercel,
no serverless — runs on your own platform (VPS, Render, Railway, Fly.io, …).

**Plain Node**

```bash
npm ci
npm run build      # → dist/
npm start          # serves dist/ + /api/ai on $PORT (default 8787)
```

**Docker**

```bash
docker compose up --build     # reads ANTHROPIC_API_KEY / VITE_* from your env or .env
# or
docker build -t founder-english-os \
  --build-arg VITE_SUPABASE_URL=... --build-arg VITE_SUPABASE_ANON_KEY=... .
docker run -p 8787:8787 -e ANTHROPIC_API_KEY=... founder-english-os
```

Put it behind your own Nginx/Caddy/Cloudflare for TLS. Health check: `GET /healthz`.

> Note: `VITE_*` values are baked in at **build** time (they ship to the
> browser — the Supabase anon key is meant to be public). `ANTHROPIC_API_KEY`
> is read at **runtime** by the server and never reaches the browser.

## Tech

React 19 · TypeScript · Vite · React Router · Zustand · Recharts ·
Web Speech API · Supabase · Anthropic (Claude) · self-hosted Node + Express · Docker.

_Private personal training app. No payments, no multi-user SaaS — by design._
