import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Mistake,
  Phrase,
  Session,
  ScoreRecord,
  ScoreSet,
  UserProfile,
  Confidence,
} from '../types'
import {
  SEED_PROFILE,
  SEED_MISTAKES,
  SEED_PHRASES,
  SEED_SESSIONS,
  SEED_SCORES,
} from '../data/seed'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00').getTime()
  const db = new Date(b + 'T00:00:00').getTime()
  return Math.round((db - da) / 86_400_000)
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}`
}

interface AppState {
  profile: UserProfile
  mistakes: Mistake[]
  phrases: Phrase[]
  sessions: Session[]
  scores: ScoreRecord[]

  // Mistakes
  addMistake: (m: Omit<Mistake, 'id' | 'date'>) => void
  removeMistake: (id: string) => void

  // Phrases
  addPhrase: (p: Omit<Phrase, 'id' | 'date'>) => void
  removePhrase: (id: string) => void
  setPhraseConfidence: (id: string, confidence: Confidence) => void

  // Sessions + scores
  completeSession: (s: Omit<Session, 'id' | 'date'>) => void

  // Profile
  updateProfile: (patch: Partial<UserProfile>) => void

  // Housekeeping
  resetAll: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: SEED_PROFILE,
      mistakes: SEED_MISTAKES,
      phrases: SEED_PHRASES,
      sessions: SEED_SESSIONS,
      scores: SEED_SCORES,

      addMistake: (m) =>
        set((s) => ({
          mistakes: [{ ...m, id: uid('m'), date: new Date().toISOString() }, ...s.mistakes],
        })),

      removeMistake: (id) => set((s) => ({ mistakes: s.mistakes.filter((m) => m.id !== id) })),

      addPhrase: (p) =>
        set((s) => ({
          phrases: [{ ...p, id: uid('p'), date: new Date().toISOString() }, ...s.phrases],
        })),

      removePhrase: (id) => set((s) => ({ phrases: s.phrases.filter((p) => p.id !== id) })),

      setPhraseConfidence: (id, confidence) =>
        set((s) => ({
          phrases: s.phrases.map((p) => (p.id === id ? { ...p, confidence } : p)),
        })),

      completeSession: (input) =>
        set((s) => {
          const now = new Date().toISOString()
          const session: Session = { ...input, id: uid('ses'), date: now }

          // Streak update
          const today = todayKey()
          const prev = s.profile.lastActiveDay
          let currentStreak = s.profile.currentStreak
          if (prev !== today) {
            if (prev && daysBetween(prev, today) === 1) currentStreak += 1
            else currentStreak = 1
          }
          const longestStreak = Math.max(s.profile.longestStreak, currentStreak)

          // Score record
          const scoreRecords = input.score
            ? [
                {
                  ...input.score,
                  id: uid('score'),
                  date: now,
                  scenarioId: input.scenarioId,
                  scenarioTitle: input.scenarioTitle,
                } as ScoreRecord,
              ]
            : []

          return {
            sessions: [session, ...s.sessions],
            scores: [...scoreRecords, ...s.scores],
            profile: { ...s.profile, lastActiveDay: today, currentStreak, longestStreak },
          }
        }),

      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),

      resetAll: () =>
        set({
          profile: { name: 'Founder', level: 'B2 · Upper-intermediate', lastActiveDay: null, currentStreak: 0, longestStreak: 0 },
          mistakes: [],
          phrases: [],
          sessions: [],
          scores: [],
        }),
    }),
    { name: 'founder-english-os' }
  )
)

// ── Derived selectors (pure helpers used across screens) ─────────────────────

export function latestScore(scores: ScoreRecord[]): ScoreSet | null {
  if (!scores.length) return null
  const sorted = [...scores].sort((a, b) => b.date.localeCompare(a.date))
  const { fluency, clarity, grammar, vocabulary, pronunciation, confidence, founderPresence } = sorted[0]
  return { fluency, clarity, grammar, vocabulary, pronunciation, confidence, founderPresence }
}

export function averageScore(score: ScoreSet | null): number {
  if (!score) return 0
  const vals = Object.values(score)
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

/** Most frequent mistake themes, ranked. Groups by the corrected phrase's shape. */
export function topRepeatedMistakes(
  mistakes: Mistake[]
): Array<{ label: string; count: number }> {
  const buckets: Record<string, number> = {}
  for (const m of mistakes) {
    // Bucket by a normalized key of the correction to surface repeats
    const key = m.corrected.trim().toLowerCase().replace(/[.,!?]/g, '').slice(0, 48)
    buckets[key] = (buckets[key] || 0) + 1
  }
  return Object.entries(buckets)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}
