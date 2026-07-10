import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, Tag, Button } from '../components'
import { CURRICULUM } from '../data/curriculum'
import { useAppStore } from '../store/app'

const INTENSITY: Record<1 | 2 | 3, string> = { 1: 'Warm-up', 2: 'Focused', 3: 'Challenge' }

export default function Learn() {
  const navigate = useNavigate()
  const completed = useAppStore((s) => s.completedLessons)

  const groups = useMemo(() => {
    const map = new Map<string, typeof CURRICULUM>()
    for (const l of CURRICULUM) {
      const arr = map.get(l.category) ?? []
      arr.push(l)
      map.set(l.category, arr)
    }
    return Array.from(map.entries())
  }, [])

  const done = completed.length
  const pct = Math.round((done / CURRICULUM.length) * 100)

  return (
    <Page
      eyebrow="Learn"
      title="Your training plan"
      intro="Short lessons built for founders. Each one teaches a skill in Spanish, gives you the key phrases with audio, and then trains you with guided drills until it sticks."
      actions={
        <Button variant="primary" onClick={() => navigate(`/learn/${nextLesson(completed)}`)}>
          {done === 0 ? 'Start the first lesson' : 'Continue training'}
        </Button>
      }
    >
      {/* Progress bar */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fos-ink-3)' }}>
            Lessons completed
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fos-accent)' }}>{done} / {CURRICULUM.length}</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, backgroundColor: 'var(--fos-surface-4)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--fos-accent)', borderRadius: 2, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
        {groups.map(([category, lessons]) => (
          <div key={category}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fos-ink-3)', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--fos-rule)' }}>
              {category}
            </div>
            <div className="fos-col-2" style={{ gap: 12 }}>
              {lessons.map((l) => {
                const isDone = completed.includes(l.id)
                return (
                  <button
                    key={l.id}
                    onClick={() => navigate(`/learn/${l.id}`)}
                    style={{
                      textAlign: 'left',
                      backgroundColor: 'var(--fos-surface-1)',
                      border: `1px solid ${isDone ? 'var(--fos-accent-muted)' : 'var(--fos-border)'}`,
                      borderRadius: 4,
                      padding: 18,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--fos-accent-muted)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDone ? 'var(--fos-accent-muted)' : 'var(--fos-border)' }}
                  >
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Tag label={INTENSITY[l.intensity]} tone="accent" dot />
                      {isDone && <Tag label="✓ Done" tone="accent" />}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, color: 'var(--fos-ink)', margin: 0, lineHeight: 1.3 }}>
                      {l.titleEs}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fos-ink-2)', margin: 0 }}>{l.goalEs}</p>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Page>
  )
}

function nextLesson(completed: string[]): string {
  const next = CURRICULUM.find((l) => !completed.includes(l.id))
  return (next ?? CURRICULUM[0]).id
}
