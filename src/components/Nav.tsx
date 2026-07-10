import { NavLink } from 'react-router-dom'
import { useIsMobile } from '../hooks/useViewport'
import { useAppStore } from '../store/app'
import Wordmark from './primitives/Wordmark'

const SCREENS = [
  { path: '/', label: 'Dashboard', short: 'HOME' },
  { path: '/learn', label: 'Learn', short: 'LEARN' },
  { path: '/practice', label: 'Practice Room', short: 'PRACTICE' },
  { path: '/scenarios', label: 'Scenarios', short: 'SCENES' },
  { path: '/errors', label: 'Error Log', short: 'ERRORS' },
  { path: '/phrases', label: 'Phrase Bank', short: 'PHRASES' },
  { path: '/progress', label: 'Progress', short: 'PROGRESS' },
]

export default function Nav() {
  const isMobile = useIsMobile()
  const streak = useAppStore((s) => s.profile.currentStreak)

  return (
    <nav
      style={{
        height: isMobile ? 46 : 52,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        padding: isMobile ? '0 14px' : '0 32px',
        borderBottom: '1px solid var(--fos-rule)',
        flexShrink: 0,
        backgroundColor: 'var(--fos-surface-1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <NavLink
        to="/"
        style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          paddingRight: isMobile ? 12 : 28,
          borderRight: isMobile ? 'none' : '1px solid var(--fos-rule)',
          flexShrink: 0,
        }}
      >
        <Wordmark size={isMobile ? 'sm' : 'md'} />
      </NavLink>

      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          flex: 1,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {SCREENS.map(({ path, label, short }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            style={({ isActive }) => ({
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              padding: isMobile ? '0 10px' : '0 15px',
              fontFamily: 'var(--font-sans)',
              fontSize: isMobile ? 11 : 12.5,
              fontWeight: isActive ? 500 : 400,
              color: isActive ? 'var(--fos-ink)' : 'var(--fos-ink-3)',
              borderBottom: isActive ? '1px solid var(--fos-accent)' : '1px solid transparent',
              letterSpacing: '0.01em',
              transition: 'color 0.15s ease, border-color 0.15s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            })}
          >
            {isMobile ? short : label}
          </NavLink>
        ))}
      </div>

      {!isMobile && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingLeft: 20,
            borderLeft: '1px solid var(--fos-rule)',
            flexShrink: 0,
          }}
          title="Your current streak"
        >
          <span style={{ fontSize: 13 }}>🔥</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: streak > 0 ? 'var(--fos-warm)' : 'var(--fos-ink-3)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {streak} day{streak === 1 ? '' : 's'}
          </span>
        </div>
      )}
    </nav>
  )
}
