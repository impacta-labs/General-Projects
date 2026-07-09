/* eslint-disable @typescript-eslint/no-explicit-any */
// Vercel serverless function — req/res and model JSON are dynamic boundaries.
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const MODEL = 'claude-haiku-4-5-20251001'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { action, params } = req.body || {}

  if (!action || !params) {
    res.status(400).json({ error: 'Missing action or params' })
    return
  }

  try {
    if (action === 'coach') {
      const { scenarioTitle, scenarioBrief, history = [], userText } = params

      const transcript = (history as Array<{ role: string; text: string }>)
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
      const data = extractJSON(text)
      return res.json({ success: true, data })
    }

    if (action === 'scoreSession') {
      const { scenarioTitle, history = [] } = params

      const transcript = (history as Array<{ role: string; text: string }>)
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
      const data = extractJSON(text)
      return res.json({ success: true, data })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (error: any) {
    console.error('AI proxy error:', error?.message)
    return res.status(500).json({ error: 'AI generation failed', detail: error?.message })
  }
}

function extractJSON(text: string): any {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Could not extract JSON from response')
  }
}
