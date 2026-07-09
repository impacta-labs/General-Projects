interface ScoreBarProps {
  label: string
  value: number // 1–10
  sublabel?: string
}

function toneFor(v: number): string {
  if (v >= 8) return 'var(--fos-accent)'
  if (v >= 6) return 'var(--fos-accent-strong)'
  if (v >= 4) return 'var(--fos-warm)'
  return 'var(--fos-mistake)'
}

export default function ScoreBar({ label, value, sublabel }: ScoreBarProps) {
  const pct = Math.max(0, Math.min(10, value)) * 10
  const tone = toneFor(value)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fos-ink)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: tone, fontVariantNumeric: 'tabular-nums' }}>
          {value.toFixed(value % 1 === 0 ? 0 : 1)}
          <span style={{ color: 'var(--fos-ink-3)', fontSize: 11 }}>/10</span>
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 2, backgroundColor: 'var(--fos-surface-4)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: tone,
            borderRadius: 2,
            transition: 'width 0.5s cubic-bezier(0.25,0.1,0.25,1)',
          }}
        />
      </div>
      {sublabel && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fos-ink-3)', letterSpacing: '0.04em' }}>
          {sublabel}
        </span>
      )}
    </div>
  )
}
