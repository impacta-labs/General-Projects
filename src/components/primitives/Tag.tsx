interface TagProps {
  label: string
  tone?: 'neutral' | 'accent' | 'warm' | 'mistake'
  dot?: boolean
}

const tones = {
  neutral: { color: 'var(--fos-ink-2)', border: 'var(--fos-rule-strong)', dot: 'var(--fos-ink-3)' },
  accent: { color: 'var(--fos-accent)', border: 'var(--fos-accent-muted)', dot: 'var(--fos-accent)' },
  warm: { color: 'var(--fos-warm)', border: 'rgba(199,164,104,0.25)', dot: 'var(--fos-warm)' },
  mistake: { color: 'var(--fos-mistake)', border: 'rgba(201,135,99,0.28)', dot: 'var(--fos-mistake)' },
} as const

export default function Tag({ label, tone = 'neutral', dot = false }: TagProps) {
  const t = tones[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: t.color,
        border: `1px solid ${t.border}`,
        borderRadius: 2,
        padding: '3px 8px',
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: t.dot, flexShrink: 0 }} />
      )}
      {label}
    </span>
  )
}
