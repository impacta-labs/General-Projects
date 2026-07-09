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
| **Practice Room** | The main screen. Pick a scenario, then speak (voice) or type. After every answer the coach returns the main mistake, a natural version, a stronger founder-level version, a pronunciation/rhythm tip, a communication tip, a line to repeat out loud, and a Spanish explanation. Save any mistake or phrase in one tap. |
| **Scenario Library** | Ten real founder situations, from warm-up to challenge. |
| **Error Log** | Every saved mistake: what you said, the correction, an explanation in Spanish, an example, the date and the scenario. |
| **Phrase Bank** | Phrases you own — English, Spanish meaning, when to use it, an example, and a confidence level (shaky → solid). |
| **Progress** | Seven skills scored 1–10 after each session: fluency, clarity, grammar, vocabulary, pronunciation, confidence and founder presence — with a trend line and full session history. |

## The coach

During practice the coach speaks in **simple, natural English** and explains the
important corrections in **Spanish**. It corrects only the single most important
mistake per answer, stays calm and encouraging, and keeps the roleplay going.

- **With an Anthropic API key** (deployed on Vercel), the coach is powered by
  Claude via the `/api/ai` serverless function.
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

Set these to enable cloud backup (and the Claude-powered coach on Vercel):

```
VITE_SUPABASE_URL=...          # frontend — Supabase project URL
VITE_SUPABASE_ANON_KEY=...     # frontend — Supabase anon key
ANTHROPIC_API_KEY=...          # serverless /api/ai — Claude coach
```

To enable cloud backup: run `supabase/schema.sql` in the Supabase SQL editor,
then turn on **Anonymous sign-ins** in Authentication → Providers.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run preview    # serve the production build
```

## Tech

React 19 · TypeScript · Vite · React Router · Zustand · Recharts ·
Web Speech API · Supabase · Anthropic (Claude) · deployed on Vercel.

_Private personal training app. No payments, no multi-user SaaS — by design._
