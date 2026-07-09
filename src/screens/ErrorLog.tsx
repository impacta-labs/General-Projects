import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, Tag, Button } from '../components'
import { useAppStore } from '../store/app'
import { speak, speechSynthesisSupported } from '../lib/voice'

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ErrorLog() {
  const navigate = useNavigate()
  const { mistakes, removeMistake } = useAppStore()
  const [filter, setFilter] = useState<string>('all')
  const tts = speechSynthesisSupported()

  const scenarioOptions = useMemo(() => {
    const set = new Map<string, string>()
    mistakes.forEach((m) => set.set(m.scenarioId, m.scenarioTitle))
    return Array.from(set.entries())
  }, [mistakes])

  const visible = filter === 'all' ? mistakes : mistakes.filter((m) => m.scenarioId === filter)

  return (
    <Page
      eyebrow="Error Log"
      title="Every mistake, once"
      intro="Mistakes aren't failures — they're the fastest way to sound natural. Each one comes with a correction, an explanation in Spanish, and an example to reuse."
      actions={<Button variant="primary" onClick={() => navigate('/practice')}>Practice more</Button>}
    >
      {mistakes.length === 0 ? (
        <EmptyState
          title="No mistakes logged yet"
          body="When you practice in the Practice Room, tap “Save mistake” on any correction and it lands here — corrected, explained in Spanish, with an example."
          cta={() => navigate('/practice')}
        />
      ) : (
        <>
          {scenarioOptions.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
              <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label={`All (${mistakes.length})`} />
              {scenarioOptions.map(([id, title]) => (
                <FilterChip key={id} active={filter === id} onClick={() => setFilter(id)} label={title} />
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {visible.map((m) => (
              <div key={m.id} style={{ backgroundColor: 'var(--fos-surface-1)', border: '1px solid var(--fos-border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 18px', borderBottom: '1px solid var(--fos-rule)' }}>
                  <Tag label={m.scenarioTitle} tone="neutral" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fos-ink-3)', letterSpacing: '0.04em' }}>{fmtDate(m.date)}</span>
                    <button onClick={() => removeMistake(m.id)} title="Delete" style={delBtn}>✕</button>
                  </div>
                </div>
                <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="fos-col-2" style={{ gap: 16 }}>
                    <Field label="You said" tone="mistake">
                      <span style={{ color: 'var(--fos-mistake)', textDecoration: 'line-through', textDecorationColor: 'rgba(201,135,99,0.4)' }}>{m.original}</span>
                    </Field>
                    <Field label="Corrected" tone="accent">
                      <span style={{ display: 'inline-flex', gap: 8, alignItems: 'baseline' }}>
                        <span style={{ color: 'var(--fos-accent-strong)' }}>{m.corrected}</span>
                        {tts && <button onClick={() => speak(m.corrected)} title="Hear it" style={playBtn}>▶</button>}
                      </span>
                    </Field>
                  </div>
                  <Field label="Explicación (ES)">
                    <span style={{ color: 'var(--fos-ink-2)', fontStyle: 'italic' }}>{m.explanationEs}</span>
                  </Field>
                  {m.example && (
                    <Field label="Example">
                      <span style={{ color: 'var(--fos-ink)' }}>“{m.example}”</span>
                    </Field>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Page>
  )
}

function Field({ label, tone, children }: { label: string; tone?: 'accent' | 'mistake'; children: React.ReactNode }) {
  const color = tone === 'accent' ? 'var(--fos-accent)' : tone === 'mistake' ? 'var(--fos-mistake)' : 'var(--fos-ink-3)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color }}>{label}</span>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.5 }}>{children}</div>
    </div>
  )
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        padding: '6px 12px',
        borderRadius: 3,
        cursor: 'pointer',
        border: `1px solid ${active ? 'var(--fos-accent-muted)' : 'var(--fos-border)'}`,
        backgroundColor: active ? 'var(--fos-accent-subtle)' : 'transparent',
        color: active ? 'var(--fos-accent)' : 'var(--fos-ink-2)',
      }}
    >
      {label}
    </button>
  )
}

export function EmptyState({ title, body, cta }: { title: string; body: string; cta?: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--fos-rule-strong)', borderRadius: 6 }}>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--fos-ink-2)', margin: '0 0 10px' }}>{title}</h3>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--fos-ink-3)', maxWidth: 440, margin: '0 auto 22px', lineHeight: 1.6 }}>{body}</p>
      {cta && <Button variant="primary" onClick={cta}>Go to Practice Room</Button>}
    </div>
  )
}

const delBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fos-ink-3)', fontSize: 12, padding: 0 }
const playBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fos-ink-3)', fontSize: 11, padding: 0 }
