import type { Mistake, Phrase, Session, ScoreRecord, UserProfile } from '../types'

// A light, honest starting state so the room feels lived-in — the founder can
// clear it any time from Progress. Dates are relative to first load.

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function dayKey(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export const SEED_PROFILE: UserProfile = {
  name: 'Founder',
  level: 'B2 · Upper-intermediate',
  lastActiveDay: dayKey(1),
  currentStreak: 3,
  longestStreak: 5,
}

export const SEED_MISTAKES: Mistake[] = [
  {
    id: 'm-seed-1',
    original: 'I have 32 years',
    corrected: "I'm 32 years old",
    explanationEs: 'En inglés la edad se dice con el verbo “to be”, no con “have”. Decimos “I am 32”, nunca “I have 32”.',
    example: "I'm 32, and I've been building companies for a decade.",
    date: daysAgo(1),
    scenarioId: 'introduce-self',
    scenarioTitle: 'Introduce myself at an international event',
  },
  {
    id: 'm-seed-2',
    original: 'We are a company who make software for restaurants',
    corrected: 'We build software for restaurants',
    explanationEs: 'Más directo y fuerte: usa un verbo de acción (“build”) en lugar de “are a company who make”. Suena más de founder.',
    example: 'We build software that helps restaurants run smoother.',
    date: daysAgo(2),
    scenarioId: 'talk-about-company',
    scenarioTitle: 'Talk about my company',
  },
  {
    id: 'm-seed-3',
    original: 'Actually, I work in this since two years',
    corrected: "I've been doing this for two years",
    explanationEs: 'Para una acción que empezó en el pasado y sigue hoy, usa present perfect continuous: “I’ve been doing this for two years”. “Since” se usa con un punto de inicio (since 2022).',
    example: "I've been running the company for two years now.",
    date: daysAgo(4),
    scenarioId: 'explain-what-i-do',
    scenarioTitle: 'Explain what I do',
  },
]

export const SEED_PHRASES: Phrase[] = [
  {
    id: 'p-seed-1',
    english: "Let me walk you through it",
    spanish: 'Déjame explicártelo paso a paso',
    situation: 'Starting an explanation or a demo',
    example: "Let me walk you through how it works in about a minute.",
    confidence: 2,
    date: daysAgo(1),
  },
  {
    id: 'p-seed-2',
    english: "That's a fair question",
    spanish: 'Es una pregunta justa / razonable',
    situation: 'Buying a second to answer something hard',
    example: "That's a fair question — here's how we think about it.",
    confidence: 1,
    date: daysAgo(2),
  },
  {
    id: 'p-seed-3',
    english: "We're focused on",
    spanish: 'Estamos centrados en',
    situation: 'Describing priorities and strategy',
    example: "Right now we're focused on getting our first ten customers.",
    confidence: 3,
    date: daysAgo(5),
  },
]

export const SEED_SCORES: ScoreRecord[] = [
  {
    id: 's-seed-1',
    date: daysAgo(6),
    scenarioId: 'explain-what-i-do',
    scenarioTitle: 'Explain what I do',
    fluency: 5, clarity: 6, grammar: 5, vocabulary: 5, pronunciation: 5, confidence: 4, founderPresence: 5,
  },
  {
    id: 's-seed-2',
    date: daysAgo(3),
    scenarioId: 'talk-about-company',
    scenarioTitle: 'Talk about my company',
    fluency: 6, clarity: 6, grammar: 6, vocabulary: 6, pronunciation: 5, confidence: 5, founderPresence: 6,
  },
  {
    id: 's-seed-3',
    date: daysAgo(1),
    scenarioId: 'introduce-self',
    scenarioTitle: 'Introduce myself at an international event',
    fluency: 6, clarity: 7, grammar: 6, vocabulary: 6, pronunciation: 6, confidence: 6, founderPresence: 6,
  },
]

export const SEED_SESSIONS: Session[] = [
  {
    id: 'ses-seed-1',
    scenarioId: 'explain-what-i-do',
    scenarioTitle: 'Explain what I do',
    date: daysAgo(6),
    turns: 6,
    mistakesLogged: 1,
    phrasesSaved: 1,
    score: SEED_SCORES[0],
  },
  {
    id: 'ses-seed-2',
    scenarioId: 'talk-about-company',
    scenarioTitle: 'Talk about my company',
    date: daysAgo(3),
    turns: 8,
    mistakesLogged: 1,
    phrasesSaved: 1,
    score: SEED_SCORES[1],
  },
  {
    id: 'ses-seed-3',
    scenarioId: 'introduce-self',
    scenarioTitle: 'Introduce myself at an international event',
    date: daysAgo(1),
    turns: 5,
    mistakesLogged: 1,
    phrasesSaved: 1,
    score: SEED_SCORES[2],
  },
]
