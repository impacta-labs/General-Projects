interface RuleProps {
  weight?: 'light' | 'strong'
  className?: string
  style?: React.CSSProperties
}

export default function Rule({ weight = 'light', className, style }: RuleProps) {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: weight === 'strong'
          ? '1px solid var(--fos-border-strong)'
          : '1px solid var(--fos-rule)',
        margin: 0,
        ...style,
      }}
      className={className}
    />
  )
}
