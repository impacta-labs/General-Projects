/* eslint-disable @typescript-eslint/no-explicit-any */
// Supabase rows are an untyped external boundary — mappers convert to/from app types.
import { supabase, SUPABASE_ENABLED } from './supabase'
import { useAppStore } from '../store/app'
import type { Mistake, Phrase, Session, ScoreRecord } from '../types'

// Best-effort cloud backup for the private single-user app.
// No login screen: we sign in anonymously and scope rows via RLS.
// Everything is defensive — any failure leaves the local-first app untouched.

let ownerId: string | null = null
let ready = false

async function ensureAuth(): Promise<string | null> {
  if (!SUPABASE_ENABLED) return null
  if (ownerId) return ownerId
  const { data } = await supabase.auth.getSession()
  if (data.session?.user) {
    ownerId = data.session.user.id
    return ownerId
  }
  const { data: signIn, error } = await supabase.auth.signInAnonymously()
  if (error || !signIn.user) return null
  ownerId = signIn.user.id
  return ownerId
}

/** Pull remote state on boot and merge into the store (remote wins if present). */
export async function pullRemote(): Promise<void> {
  const owner = await ensureAuth()
  if (!owner) return
  try {
    const [profileR, mistakesR, phrasesR, sessionsR, scoresR] = await Promise.all([
      supabase.from('user_profile').select('*').eq('id', owner).maybeSingle(),
      supabase.from('mistakes').select('*').eq('owner', owner),
      supabase.from('phrases').select('*').eq('owner', owner),
      supabase.from('sessions').select('*').eq('owner', owner),
      supabase.from('scores').select('*').eq('owner', owner),
    ])

    const store = useAppStore.getState()
    const patch: Partial<ReturnType<typeof useAppStore.getState>> = {}

    if (profileR.data) {
      patch.profile = {
        name: profileR.data.name ?? store.profile.name,
        level: profileR.data.level ?? store.profile.level,
        lastActiveDay: profileR.data.last_active_day ?? store.profile.lastActiveDay,
        currentStreak: profileR.data.current_streak ?? store.profile.currentStreak,
        longestStreak: profileR.data.longest_streak ?? store.profile.longestStreak,
      }
    }
    if (mistakesR.data?.length) patch.mistakes = mistakesR.data.map(fromMistake)
    if (phrasesR.data?.length) patch.phrases = phrasesR.data.map(fromPhrase)
    if (sessionsR.data?.length) patch.sessions = sessionsR.data.map(fromSession)
    if (scoresR.data?.length) patch.scores = scoresR.data.map(fromScore)

    if (Object.keys(patch).length) useAppStore.setState(patch)
  } catch {
    /* offline / not configured — keep local state */
  }
  ready = true
}

/** Push the full local snapshot up (upsert). Debounced by the caller. */
export async function pushRemote(): Promise<void> {
  if (!ready) return
  const owner = await ensureAuth()
  if (!owner) return
  const s = useAppStore.getState()
  try {
    await Promise.all([
      supabase.from('user_profile').upsert({
        id: owner,
        name: s.profile.name,
        level: s.profile.level,
        last_active_day: s.profile.lastActiveDay,
        current_streak: s.profile.currentStreak,
        longest_streak: s.profile.longestStreak,
        updated_at: new Date().toISOString(),
      }),
      s.mistakes.length &&
        supabase.from('mistakes').upsert(s.mistakes.map((m) => toMistake(m, owner))),
      s.phrases.length &&
        supabase.from('phrases').upsert(s.phrases.map((p) => toPhrase(p, owner))),
      s.sessions.length &&
        supabase.from('sessions').upsert(s.sessions.map((x) => toSession(x, owner))),
      s.scores.length &&
        supabase.from('scores').upsert(s.scores.map((x) => toScore(x, owner))),
    ])
  } catch {
    /* best-effort — ignore */
  }
}

// ── Row mappers ──────────────────────────────────────────────────────────────

function toMistake(m: Mistake, owner: string) {
  return {
    id: m.id, owner, original: m.original, corrected: m.corrected,
    explanation_es: m.explanationEs, example: m.example, date: m.date,
    scenario_id: m.scenarioId, scenario_title: m.scenarioTitle,
  }
}
function fromMistake(r: any): Mistake {
  return {
    id: r.id, original: r.original, corrected: r.corrected,
    explanationEs: r.explanation_es, example: r.example, date: r.date,
    scenarioId: r.scenario_id, scenarioTitle: r.scenario_title,
  }
}
function toPhrase(p: Phrase, owner: string) {
  return {
    id: p.id, owner, english: p.english, spanish: p.spanish,
    situation: p.situation, example: p.example, confidence: p.confidence, date: p.date,
  }
}
function fromPhrase(r: any): Phrase {
  return {
    id: r.id, english: r.english, spanish: r.spanish, situation: r.situation,
    example: r.example, confidence: (r.confidence ?? 1) as Phrase['confidence'], date: r.date,
  }
}
function toSession(x: Session, owner: string) {
  return {
    id: x.id, owner, scenario_id: x.scenarioId, scenario_title: x.scenarioTitle,
    date: x.date, turns: x.turns, mistakes_logged: x.mistakesLogged,
    phrases_saved: x.phrasesSaved, score: x.score ?? null,
  }
}
function fromSession(r: any): Session {
  return {
    id: r.id, scenarioId: r.scenario_id, scenarioTitle: r.scenario_title,
    date: r.date, turns: r.turns, mistakesLogged: r.mistakes_logged,
    phrasesSaved: r.phrases_saved, score: r.score ?? undefined,
  }
}
function toScore(x: ScoreRecord, owner: string) {
  return {
    id: x.id, owner, date: x.date, scenario_id: x.scenarioId, scenario_title: x.scenarioTitle,
    fluency: x.fluency, clarity: x.clarity, grammar: x.grammar, vocabulary: x.vocabulary,
    pronunciation: x.pronunciation, confidence: x.confidence, founder_presence: x.founderPresence,
  }
}
function fromScore(r: any): ScoreRecord {
  return {
    id: r.id, date: r.date, scenarioId: r.scenario_id, scenarioTitle: r.scenario_title,
    fluency: r.fluency, clarity: r.clarity, grammar: r.grammar, vocabulary: r.vocabulary,
    pronunciation: r.pronunciation, confidence: r.confidence, founderPresence: r.founder_presence,
  }
}
