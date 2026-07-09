import type { ReactNode } from 'react'
import { useIsMobile } from '../../hooks/useViewport'

interface PageProps {
  eyebrow?: string
  title: string
  intro?: string
  actions?: ReactNode
  children: ReactNode
  maxWidth?: number
}

// Consistent page frame: a calm header, generous whitespace, centered column.
export default function Page({ eyebrow, title, intro, actions, children, maxWidth = 1080 }: PageProps) {
  const isMobile = useIsMobile()
  return (
    <div
      style={{
        width: '100%',
        maxWidth,
        margin: '0 auto',
        padding: isMobile ? '28px 18px 72px' : '48px 40px 96px',
        animation: 'fos-fade-up 0.4s ease both',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
          marginBottom: intro ? 14 : 28,
        }}
      >
        <div style={{ minWidth: 0 }}>
          {eyebrow && (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--fos-accent)',
                marginBottom: 10,
              }}
            >
              {eyebrow}
            </div>
          )}
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: isMobile ? 26 : 34,
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'var(--fos-ink)',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>
        </div>
        {actions && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{actions}</div>}
      </header>

      {intro && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            color: 'var(--fos-ink-2)',
            maxWidth: 640,
            margin: '0 0 30px',
            lineHeight: 1.6,
          }}
        >
          {intro}
        </p>
      )}

      {children}
    </div>
  )
}
