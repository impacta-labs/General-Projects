import type { ReactNode } from 'react'

interface StatProps {
  label: string
  value: ReactNode
  meta?: string
  accent?: boolean
}

// A quiet metric block for the dashboard.
export default function Stat({ label, value, meta, accent = false }: StatProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '20px 22px',
        backgroundColor: 'var(--fos-surface-1)',
        border: '1px solid var(--fos-border)',
        borderRadius: 4,
        minHeight: 112,
        justifyContent: 'space-between',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--fos-ink-3)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 34,
          fontWeight: 500,
          lineHeight: 1,
          color: accent ? 'var(--fos-accent)' : 'var(--fos-ink)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
      {meta && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fos-ink-2)' }}>{meta}</span>
      )}
    </div>
  )
}
