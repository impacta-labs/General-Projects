// Founder English OS — self-hosted server.
// One Node process serves the built frontend (dist/) AND the AI coach API.
// Runs anywhere: a VPS, Docker, Render, Railway, Fly.io — no Vercel required.
//
//   npm run build      # build the frontend into dist/
//   npm start          # serve dist/ + /api/ai on $PORT (default 8787)

import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import Anthropic from '@anthropic-ai/sdk'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.resolve(__dirname, '..', 'dist')
const PORT = process.env.PORT || 8787
const MODEL = process.env.COACH_MODEL || 'claude-haiku-4-5-20251001'

const hasKey = Boolean(process.env.ANTHROPIC_API_KEY)
const client = hasKey ? new Anthropic() : null

const app = express()
app.use(express.json({ limit: '1mb' }))

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/healthz', (_req, res) => {
  res.json({ ok: true, ai: hasKey, model: hasKey ? MODEL : null })
})

// ── AI coach API ─────────────────────────────────────────────────────────────
app.post('/api/ai', async (req, res) => {
  const { action, params } = req.body || {}
  if (!action || !params) return res.status(400).json({ error: 'Missing action or params' })

  // No API key configured → let the frontend fall back to its local coach.
  if (!client) return res.status(503).json({ error: 'AI not configured' })

  try {
    if (action === 'coach') {
      const { scenarioTitle, scenarioBrief, history = [], userText } = params
      const transcript = history
        .map((t) => `${t.role === 'coach' ? 'Coach' : 'Founder'}: ${t.text}`)
        .join('\n')

      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 1100,
        system: `You are a calm, warm, world-class English speaking coach for a Spanish entrepreneur (a startup founder). The goal is NOT academic English — it is speaking clearly, naturally, calmly and confidently in real business situations: networking, meetings, pitches, public speaking, AI conversations and founder communication.

Rules:
- During the conversation you speak in SIMPLE, natural English. Short sentences. No jargon.
- You explain the important correction in SPANISH (the founder's language), briefly and kindly.
- You are encouraging but honest. Never harsh. Calm, like a private coach in a quiet room.
- Correct only the ONE most important mistake per answer. If the answer is already good, mainMistake is "".
- The "founderVersion" should sound like a confident founder — clear, calm, a little more powerful.
- Keep "reply" natural: react to what they said AND keep the roleplay going with a follow-up question, staying in character for the scenario.`,
        messages: [
          {
            role: 'user',
            content: `Scenario: "${scenarioTitle}" — ${scenarioBrief}

Conversation so far:
${transcript || '(this is the founder\'s first answer)'}

The founder just said:
"${userText}"

Coach this answer. Respond ONLY with valid JSON, no markdown:
{
  "reply": "natural English reply that reacts and asks a follow-up to keep practicing",
  "mainMistake": "the single most important mistake in their words, or \\"\\" if none",
  "naturalVersion": "a natural, correct version of what they tried to say",
  "founderVersion": "a stronger, confident founder-level version",
  "pronunciationTip": "one short pronunciation or rhythm tip relevant to their words",
  "communicationTip": "one short delivery/communication tip (pace, pausing, tone, structure)",
  "repeatInstruction": "one short sentence for them to repeat out loud",
  "explanationEs": "brief, kind explanation IN SPANISH of the key correction (1-2 sentences)",
  "phraseEnglish": "one useful English phrase from this exchange worth saving, or \\"\\"",
  "phraseSpanish": "the Spanish meaning of that phrase, or \\"\\""
}`,
          },
        ],
      })
      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      return res.json({ success: true, data: extractJSON(text) })
    }

    if (action === 'scoreSession') {
      const { scenarioTitle, history = [] } = params
      const transcript = history
        .map((t) => `${t.role === 'coach' ? 'Coach' : 'Founder'}: ${t.text}`)
        .join('\n')

      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 500,
        system:
          'You are an English speaking coach scoring a practice session for a Spanish startup founder. Score honestly from 1 to 10 (10 = near-native, confident founder). Be fair, not generous.',
        messages: [
          {
            role: 'user',
            content: `Scenario: "${scenarioTitle}"

Full conversation:
${transcript}

Score the founder's spoken English across these dimensions from 1 to 10. Respond ONLY with valid JSON:
{"fluency":0,"clarity":0,"grammar":0,"vocabulary":0,"pronunciation":0,"confidence":0,"founderPresence":0}`,
          },
        ],
      })
      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      return res.json({ success: true, data: extractJSON(text) })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (error) {
    console.error('AI error:', error?.message)
    return res.status(500).json({ error: 'AI generation failed', detail: error?.message })
  }
})

// ── Static frontend + SPA fallback ───────────────────────────────────────────
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST))
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(DIST, 'index.html'))
  })
} else {
  console.warn('⚠  dist/ not found — run `npm run build` first. API is still available.')
}

app.listen(PORT, () => {
  console.log(`Founder English OS running on http://localhost:${PORT}`)
  console.log(`  AI coach: ${hasKey ? `on (${MODEL})` : 'off — using local fallback in the browser'}`)
})

function extractJSON(text) {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Could not extract JSON from response')
  }
}
