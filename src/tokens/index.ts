// Founder English OS — design tokens
// Mirrors the CSS custom properties in index.css for use in TS logic.

export const colors = {
  bg: '#0A0B0D',
  surface1: '#0E1013',
  surface2: '#14171B',
  surface3: '#1B1F24',
  surface4: '#232830',
  rule: '#232830',
  ruleStrong: '#2E343D',
  ink: '#ECE9E3',
  ink2: '#98A0A0',
  ink3: '#565E60',
  accent: '#82B3A4',
  accentStrong: '#9BCBBB',
  accentMuted: '#3E574F',
  warm: '#C7A468',
  mistake: '#C98763',
  improve: '#82B3A4',
  confident: '#7FA9C4',
  border: 'rgba(255, 255, 255, 0.06)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',
} as const

export const fonts = {
  serif: '"Playfair Display", Georgia, "Times New Roman", serif',
  sans: '"IBM Plex Sans", system-ui, -apple-system, sans-serif',
  mono: '"IBM Plex Mono", "Courier New", monospace',
} as const

export const typeScale = [11, 12, 13, 15, 17, 20, 24, 32, 42, 56] as const

export const duration = {
  fast: 0.2,
  base: 0.3,
  slow: 0.5,
} as const

// Score dimensions used across Practice, Progress and Dashboard
export const SCORE_DIMENSIONS = [
  { key: 'fluency', label: 'Fluency', es: 'Fluidez' },
  { key: 'clarity', label: 'Clarity', es: 'Claridad' },
  { key: 'grammar', label: 'Grammar', es: 'Gramática' },
  { key: 'vocabulary', label: 'Vocabulary', es: 'Vocabulario' },
  { key: 'pronunciation', label: 'Pronunciation', es: 'Pronunciación' },
  { key: 'confidence', label: 'Confidence', es: 'Confianza' },
  { key: 'founderPresence', label: 'Founder presence', es: 'Presencia de founder' },
] as const

export type ScoreKey = (typeof SCORE_DIMENSIONS)[number]['key']
