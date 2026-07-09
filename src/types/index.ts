// Founder English OS — domain types

export type ScenarioCategory =
  | 'introduction'
  | 'company'
  | 'networking'
  | 'meetings'
  | 'pitch'
  | 'ai'
  | 'speaking'
  | 'pressure'
  | 'casual'

export interface Scenario {
  id: string
  title: string
  /** One-line description of the situation (English) */
  brief: string
  /** Spanish framing so the founder always knows the context */
  briefEs: string
  category: ScenarioCategory
  /** Difficulty 1–3 */
  intensity: 1 | 2 | 3
  /** The coach's opening line — starts the conversation naturally */
  opener: string
  /** Short goal shown as a chip */
  goal: string
}

// ── Scores ───────────────────────────────────────────────────────────────────

export interface ScoreSet {
  fluency: number
  clarity: number
  grammar: number
  vocabulary: number
  pronunciation: number
  confidence: number
  founderPresence: number
}

export interface ScoreRecord extends ScoreSet {
  id: string
  date: string // ISO
  scenarioId: string
  scenarioTitle: string
}

// ── Mistakes ─────────────────────────────────────────────────────────────────

export interface Mistake {
  id: string
  original: string
  corrected: string
  /** Explanation in Spanish */
  explanationEs: string
  example: string
  date: string // ISO
  scenarioId: string
  scenarioTitle: string
}

// ── Phrases ──────────────────────────────────────────────────────────────────

/** 1 = shaky, 2 = getting there, 3 = solid */
export type Confidence = 1 | 2 | 3

export interface Phrase {
  id: string
  english: string
  spanish: string
  situation: string
  example: string
  confidence: Confidence
  date: string // ISO
}

// ── Sessions ─────────────────────────────────────────────────────────────────

export interface Session {
  id: string
  scenarioId: string
  scenarioTitle: string
  date: string // ISO
  turns: number
  mistakesLogged: number
  phrasesSaved: number
  score?: ScoreSet
}

// ── Profile ──────────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string
  level: string
  /** ISO date (YYYY-MM-DD) of the last day a session was completed */
  lastActiveDay: string | null
  currentStreak: number
  longestStreak: number
}

// ── Coach ────────────────────────────────────────────────────────────────────

/** A single turn in the practice conversation */
export interface ChatTurn {
  id: string
  role: 'coach' | 'user'
  text: string
  /** Attached coaching feedback (present on coach replies to a user turn) */
  feedback?: CoachFeedback
}

/** The structured feedback the coach returns after each user answer */
export interface CoachFeedback {
  /** Natural conversational reply that keeps the dialogue going */
  reply: string
  /** The single most important mistake — empty string if the answer was clean */
  mainMistake: string
  /** A natural, correct version of what the user tried to say */
  naturalVersion: string
  /** A stronger, founder-level version */
  founderVersion: string
  /** Pronunciation / rhythm tip */
  pronunciationTip: string
  /** Communication / delivery tip */
  communicationTip: string
  /** A short line the user should repeat out loud */
  repeatInstruction: string
  /** Explanation of the key correction, in Spanish */
  explanationEs: string
  /** A candidate phrase worth banking (English) — may be empty */
  phraseEnglish: string
  /** Spanish meaning of that phrase — may be empty */
  phraseSpanish: string
}
