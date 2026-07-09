interface MicButtonProps {
  listening: boolean
  disabled?: boolean
  onClick: () => void
  size?: number
}

// The voice-first control. Calm when idle, a breathing ring when listening.
export default function MicButton({ listening, disabled = false, onClick, size = 76 }: MicButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={listening ? 'Stop listening' : 'Start speaking'}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1px solid ${listening ? 'var(--fos-accent)' : 'var(--fos-rule-strong)'}`,
        backgroundColor: listening ? 'var(--fos-accent-subtle)' : 'var(--fos-surface-3)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
        flexShrink: 0,
      }}
    >
      {listening && (
        <>
          <span
            style={{
              position: 'absolute',
              inset: -1,
              borderRadius: '50%',
              border: '1px solid var(--fos-accent)',
              animation: 'fos-pulse-ring 1.8s ease-out infinite',
            }}
          />
          <span
            style={{
              position: 'absolute',
              inset: -1,
              borderRadius: '50%',
              border: '1px solid var(--fos-accent)',
              animation: 'fos-pulse-ring 1.8s ease-out 0.9s infinite',
            }}
          />
        </>
      )}
      {/* Microphone glyph */}
      <svg width={size * 0.34} height={size * 0.34} viewBox="0 0 24 24" fill="none">
        <rect
          x="9" y="2" width="6" height="12" rx="3"
          fill={listening ? 'var(--fos-accent)' : 'var(--fos-ink)'}
        />
        <path
          d="M5 11a7 7 0 0 0 14 0M12 18v3"
          stroke={listening ? 'var(--fos-accent)' : 'var(--fos-ink)'}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </button>
  )
}
