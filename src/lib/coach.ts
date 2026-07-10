import type { CoachFeedback, ChatTurn, Scenario, ScoreSet } from '../types'

interface CoachRequest {
  scenario: Scenario
  history: ChatTurn[]
  userText: string
}

/** Ask the AI coach for feedback. Falls back to a local heuristic coach
 *  when no /api/ai proxy is available (e.g. running purely local). */
export async function coach(req: CoachRequest): Promise<CoachFeedback> {
  const { scenario, history, userText } = req
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'coach',
        params: {
          scenarioTitle: scenario.title,
          scenarioBrief: scenario.brief,
          history: history.map((h) => ({ role: h.role, text: h.text })),
          userText,
        },
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { data } = await res.json()
    return normalize(data)
  } catch {
    return localCoach(req)
  }
}

/** Ask the AI to score the finished session, 1–10 per dimension.
 *  Falls back to a local estimate derived from the transcript. */
export async function scoreSession(scenario: Scenario, history: ChatTurn[]): Promise<ScoreSet> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'scoreSession',
        params: { scenarioTitle: scenario.title, history: history.map((h) => ({ role: h.role, text: h.text })) },
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { data } = await res.json()
    return clampScores(data)
  } catch {
    return localScore(history)
  }
}

function normalize(d: Record<string, unknown>): CoachFeedback {
  return {
    reply: str(d?.reply) || "Nice. Let's keep going — tell me a little more.",
    mainMistake: str(d?.mainMistake),
    naturalVersion: str(d?.naturalVersion),
    founderVersion: str(d?.founderVersion),
    pronunciationTip: str(d?.pronunciationTip),
    communicationTip: str(d?.communicationTip),
    repeatInstruction: str(d?.repeatInstruction),
    explanationEs: str(d?.explanationEs),
    phraseEnglish: str(d?.phraseEnglish),
    phraseSpanish: str(d?.phraseSpanish),
  }
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function clampScores(d: Record<string, unknown>): ScoreSet {
  const c = (v: unknown) => {
    const n = typeof v === 'number' ? v : Number(v)
    if (!isFinite(n)) return 5
    return Math.max(1, Math.min(10, Math.round(n)))
  }
  return {
    fluency: c(d?.fluency),
    clarity: c(d?.clarity),
    grammar: c(d?.grammar),
    vocabulary: c(d?.vocabulary),
    pronunciation: c(d?.pronunciation),
    confidence: c(d?.confidence),
    founderPresence: c(d?.founderPresence),
  }
}

// ── Local heuristic coach ────────────────────────────────────────────────────
// Catches the most common Spanish→English speaking mistakes so the app is fully
// usable with no API key. Not as smart as the AI, but genuinely helpful.

interface Rule {
  test: RegExp
  mistake: (m: RegExpMatchArray) => string
  natural: (m: RegExpMatchArray) => string
  founder: (m: RegExpMatchArray) => string
  es: string
  pron: string
}

// Common verbs founders use — lets us spot a missing "to" (e.g. "want speak").
const VERBS =
  'speak|talk|learn|do|make|get|go|say|tell|explain|understand|improve|practice|practise|' +
  'communicate|work|build|create|start|grow|sell|meet|help|show|share|present|pitch|' +
  'know|think|see|find|use|manage|lead|hire|scale|launch|write|read|listen|travel|study'

const RULES: Rule[] = [
  {
    test: /\bi have (\d{1,2}) years?\b/i,
    mistake: (m) => `I have ${m[1]} years`,
    natural: (m) => `I'm ${m[1]} years old`,
    founder: (m) => `I'm ${m[1]}.`,
    es: 'La edad en inglés se dice con el verbo “to be”: “I’m 32”, nunca “I have 32”.',
    pron: 'Di “I’m” de forma corta y relajada, no “I am” marcado.',
  },
  {
    test: /\bexplain me\b/i,
    mistake: () => 'explain me',
    natural: () => 'explain it to me',
    founder: () => 'walk me through it',
    es: '“Explain” necesita “to”: “explain it to me”. En inglés no se dice “explain me”.',
    pron: 'Une las palabras: “ex-PLAIN it to me”.',
  },
  {
    test: /\bassist(ed)? (to|at) (the |a |an )?(meeting|event|call|conference)/i,
    mistake: (m) => m[0],
    natural: () => 'attend the meeting',
    founder: () => 'be there / join the meeting',
    es: '“Assist” es un falso amigo. “Asistir a” se dice “attend”: “I attended the event”.',
    pron: 'Marca la segunda sílaba: “at-TEND”.',
  },
  {
    test: /\bactually\b/i,
    mistake: () => 'actually (used to mean “currently”)',
    natural: () => 'currently / right now',
    founder: () => 'at the moment',
    es: '“Actually” significa “en realidad”, no “actualmente”. Para “actualmente” usa “currently” o “right now”.',
    pron: 'Cuidado: “actually” suena “AK-chu-a-lly”.',
  },
  {
    test: /\bthe people (is|are)\b|\bpeople is\b/i,
    mistake: (m) => m[0],
    natural: () => 'people are',
    founder: () => 'our users are / customers are',
    es: '“People” es plural: “people are”, no “people is”.',
    pron: 'Di “PEE-pl ar”, ligando las dos palabras.',
  },
  {
    test: /\b(since) (\w+ )?(years?|months?|weeks?|days?)\b/i,
    mistake: (m) => m[0],
    natural: (m) => `for ${m[2] || ''}${m[3]}`.trim(),
    founder: (m) => `for the past ${m[2] || ''}${m[3]}`.replace(/\s+/g, ' ').trim(),
    es: 'Con una duración usa “for” (for two years). “Since” se usa con un punto de inicio (since 2022).',
    pron: 'Di “for” corto y débil: “fer two years”.',
  },
  {
    test: /\bi am agree\b/i,
    mistake: () => 'I am agree',
    natural: () => 'I agree',
    founder: () => "I'm with you on that",
    es: '“Agree” ya es un verbo: “I agree”, sin “am”.',
    pron: 'Marca la segunda sílaba: “a-GREE”.',
  },
  {
    test: /\bmake a (question|questions)\b/i,
    mistake: () => 'make a question',
    natural: () => 'ask a question',
    founder: () => 'ask you something',
    es: 'Las preguntas se “ask”, no se “make”: “ask a question”.',
    pron: 'Di “ask” con la “a” abierta y clara.',
  },
  {
    // "it's important speak" → "important to speak"; also difficult/easy/hard…
    test: new RegExp(`\\b(important|difficult|easy|hard|necessary|possible|impossible|nice|good)\\s+(?!to\\b)(${VERBS})\\b`, 'i'),
    mistake: (m) => `${m[1]} ${m[2]}`,
    natural: (m) => `${m[1]} to ${m[2]}`,
    founder: (m) => `${m[1]} to ${m[2]}`,
    es: 'Tras adjetivos como “important/difficult/easy” el verbo lleva “to”: “important to speak”, no “important speak”.',
    pron: 'Di “to” muy corto y débil, casi “ta”: “important-ta-speak”.',
  },
  {
    // "I want speak" → "I want to speak"; want/need/like/try/hope/plan + verb
    test: new RegExp(`\\b(want|need|like|love|hope|try|plan|decide|would like|going)\\s+(?!to\\b)(${VERBS})\\b`, 'i'),
    mistake: (m) => `${m[1]} ${m[2]}`,
    natural: (m) => `${m[1]} to ${m[2]}`,
    founder: (m) => `${m[1]} to ${m[2]}`,
    es: 'Verbos como “want/need/like/try” piden “to” + verbo: “I want to speak”, no “I want speak”.',
    pron: 'Une “want to” en “wanna” al hablar rápido: “I wanna speak”.',
  },
  {
    test: /\bhow to say\b.*\?|\bhow is said\b|\bhow do you say\b/i,
    mistake: (m) => m[0],
    natural: () => 'how do you say…?',
    founder: () => 'what’s the word for…?',
    es: 'Para preguntar por una palabra: “How do you say… in English?” o “What’s the word for…?”.',
    pron: 'Liga “how-do-you” rápido: “howdya say”.',
  },
]

function localCoach({ scenario, userText }: CoachRequest): CoachFeedback {
  const text = userText.trim()
  const words = text.split(/\s+/).filter(Boolean)

  let hit: { rule: Rule; match: RegExpMatchArray } | null = null
  for (const rule of RULES) {
    const match = text.match(rule.test)
    if (match) {
      hit = { rule, match }
      break
    }
  }

  const reply = pickReply(scenario.id)

  if (hit) {
    const { rule, match } = hit
    return {
      reply,
      mainMistake: rule.mistake(match),
      naturalVersion: rule.natural(match),
      founderVersion: rule.founder(match),
      pronunciationTip: rule.pron,
      communicationTip: 'Slow down half a step and pause before your key point — it reads as confidence.',
      repeatInstruction: rule.founder(match),
      explanationEs: rule.es,
      phraseEnglish: '',
      phraseSpanish: '',
    }
  }

  // No specific rule fired — coach on delivery.
  const shortAnswer = words.length < 8
  return {
    reply,
    mainMistake: '',
    naturalVersion: text,
    founderVersion: shortAnswer
      ? `${capitalize(text)} — and here's why that matters…`
      : capitalize(text),
    pronunciationTip: 'Land the last word of each sentence clearly — don’t let it fade.',
    communicationTip: shortAnswer
      ? 'Add one more sentence. Founders give the answer, then the reason.'
      : 'Good length. Now add a short pause before your most important word.',
    repeatInstruction: shortAnswer ? 'Let me give you a bit more context.' : capitalize(text),
    explanationEs: shortAnswer
      ? 'Bien dicho. Intenta añadir una frase más: primero la respuesta, luego el porqué. Suena más de founder.'
      : 'Frase clara y correcta. Trabaja el ritmo: una pausa breve antes de tu idea principal transmite calma y seguridad.',
    phraseEnglish: '',
    phraseSpanish: '',
  }
}

const REPLIES: Record<string, string[]> = {
  default: [
    "Got it. Say a bit more — what happens next?",
    "Nice. And why does that matter to you?",
    "Okay, I'm with you. Can you give me an example?",
    "Good. Now tell me the one thing you'd want me to remember.",
  ],
}

function pickReply(scenarioId: string): string {
  const pool = REPLIES[scenarioId] || REPLIES.default
  return pool[Math.floor(Math.random() * pool.length)]
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

function localScore(history: ChatTurn[]): ScoreSet {
  const userTurns = history.filter((h) => h.role === 'user')
  const totalWords = userTurns.reduce((n, t) => n + t.text.split(/\s+/).filter(Boolean).length, 0)
  const avgLen = userTurns.length ? totalWords / userTurns.length : 0
  const flagged = history.filter((h) => h.feedback && h.feedback.mainMistake).length
  const engagement = Math.min(10, 4 + userTurns.length) // more turns → more practice
  const accuracy = Math.max(3, 8 - flagged)
  const richness = Math.max(3, Math.min(9, Math.round(avgLen / 3)))
  const base = Math.round((engagement + accuracy + richness) / 3)
  const j = (n: number) => Math.max(1, Math.min(10, n))
  return {
    fluency: j(base),
    clarity: j(base + 1),
    grammar: j(accuracy),
    vocabulary: j(richness),
    pronunciation: j(base),
    confidence: j(engagement - 1),
    founderPresence: j(base),
  }
}
