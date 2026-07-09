import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'quiet' | 'warm'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const pad: Record<Size, string> = { sm: '6px 12px', md: '9px 18px' }
const fs: Record<Size, number> = { sm: 12, md: 13 }

export default function Button({ variant = 'ghost', size = 'md', style, ...props }: ButtonProps) {
  const base: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: fs[size],
    fontWeight: 500,
    letterSpacing: '0.02em',
    padding: pad[size],
    borderRadius: 3,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    opacity: props.disabled ? 0.45 : 1,
    transition: 'background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  }

  const variants: Record<Variant, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--fos-accent)',
      color: '#0A0B0D',
      border: '1px solid var(--fos-accent)',
    },
    warm: {
      backgroundColor: 'transparent',
      color: 'var(--fos-warm)',
      border: '1px solid var(--fos-warm-subtle)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--fos-ink)',
      border: '1px solid var(--fos-border-strong)',
    },
    quiet: {
      backgroundColor: 'transparent',
      color: 'var(--fos-ink-2)',
      border: '1px solid transparent',
    },
  }

  return <button {...props} style={{ ...base, ...variants[variant], ...style }} />
}
