interface SectionHeaderProps {
  label: string
  meta?: string
  ruled?: boolean
}

export default function SectionHeader({ label, meta, ruled = true }: SectionHeaderProps) {
  return (
    <div
      style={{
        paddingBottom: 10,
        borderBottom: ruled ? '1px solid var(--fos-rule)' : undefined,
        marginBottom: 0,
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--fos-ink-3)',
          letterSpacing: '0.09em',
          textTransform: 'uppercase' as const,
        }}
      >
        {label}
      </span>
      {meta && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--fos-ink-3)',
          }}
        >
          {meta}
        </span>
      )}
    </div>
  )
}
