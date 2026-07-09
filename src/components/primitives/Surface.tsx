import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'

type Level = 1 | 2 | 3

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  level?: Level
  bordered?: boolean
}

const bg: Record<Level, string> = {
  1: 'var(--fos-surface-1)',
  2: 'var(--fos-surface-2)',
  3: 'var(--fos-surface-3)',
}

const shadow: Record<Level, string | undefined> = {
  1: undefined,
  2: '0 1px 4px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)',
  3: '0 2px 8px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)',
}

const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ level = 1, bordered = false, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        backgroundColor: bg[level],
        border: bordered ? '1px solid var(--fos-border)' : undefined,
        boxShadow: shadow[level],
        ...style,
      }}
      {...props}
    />
  )
)

Surface.displayName = 'Surface'
export default Surface
