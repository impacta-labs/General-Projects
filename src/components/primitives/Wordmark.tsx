interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg'
  subdued?: boolean
}

const sizes = { sm: 13, md: 15, lg: 20 }

// "Founder English OS" — a calm mark. FOUNDER in serif, the rest in mono caps.
export default function Wordmark({ size = 'md', subdued = false }: WordmarkProps) {
  const s = sizes[size]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: s * 0.42, userSelect: 'none' }}>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: s,
          fontWeight: 500,
          letterSpacing: '0.02em',
          color: subdued ? 'var(--fos-ink-2)' : 'var(--fos-ink)',
        }}
      >
        Founder&nbsp;English
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: s * 0.62,
          fontWeight: 500,
          letterSpacing: '0.18em',
          color: 'var(--fos-accent)',
        }}
      >
        OS
      </span>
    </span>
  )
}
