import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, Stat, Button, Tag } from '../components'
import { useAppStore, latestScore, averageScore, topRepeatedMistakes } from '../store/app'
import { SCENARIOS, INTENSITY_LABEL, CATEGORY_LABEL } from '../data/scenarios'
import { SCORE_DIMENSIONS } from '../tokens'

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile, sessions, phrases, mistakes, scores } = useAppStore()

  const score = useMemo(() => latestScore(scores), [scores])
  const avg = averageScore(score)
  const repeated = useMemo(() => topRepeatedMistakes(mistakes), [mistakes])

  // Next recommended practice: target the weakest score dimension, then map to a
  // scenario that exercises it; fall back to a scenario not practiced recently.
  const recommended = useMemo(() => {
    const practicedIds = new Set(sessions.slice(0, 3).map((s) => s.scenarioId))
    if (score) {
      const weakest = SCORE_DIMENSIONS
        .map((d) => ({ ...d, v: score[d.key] }))
        .sort((a, b) => a.v - b.v)[0]
      const map: Record<string, string> = {
        confidence: 'difficult-questions',
        founderPresence: 'founder-pitch',
        pronunciation: 'public-speaking',
        fluency: 'casual-conversation',
        clarity: 'explain-what-i-do',
        vocabulary: 'ai-business',
        grammar: 'client-meeting',
      }
      const target = SCENARIOS.find((s) => s.id === map[weakest.key])
      if (target) return { scenario: target, reason: `Your ${weakest.label.toLowerCase()} score is ${weakest.v}/10 — let's lift it.` }
    }
    const fresh = SCENARIOS.find((s) => !practicedIds.has(s.id)) ?? SCENARIOS[0]
    return { scenario: fresh, reason: 'A good place to warm up today.' }
  }, [score, sessions])

  const fmtLevel = profile.level

  return (
    <Page
      eyebrow="Training room"
      title={greeting()}
      intro="A quiet space to practice speaking English the way founders actually speak — clear, calm, and confident. Not a classroom."
      actions={<Button variant="primary" onClick={() => navigate('/practice')}>Start practising</Button>}
    >
      {/* Metric row */}
      <div className="fos-col-4" style={{ gap: 14, marginBottom: 32 }}>
        <Stat
          label="Daily streak"
          value={<span>{profile.currentStreak}<span style={{ fontSize: 15, color: 'var(--fos-ink-3)' }}> 🔥</span></span>}
          meta={profile.currentStreak > 0 ? `Best: ${profile.longestStreak} days` : 'Practice today to start one'}
          accent={profile.currentStreak > 0}
        />
        <Stat label="Sessions" value={sessions.length} meta="completed so far" />
        <Stat label="Phrases learned" value={phrases.length} meta="in your phrase bank" />
        <Stat
          label="Overall"
          value={avg ? avg.toFixed(1) : '—'}
          meta={avg ? 'average across skills' : 'no scores yet'}
          accent={avg >= 6}
        />
      </div>

      <div className="fos-col-right-360" style={{ gap: 20, alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Current level */}
          <Panel title="Current level">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--fos-ink)' }}>
                {fmtLevel.split('·')[0].trim()}
              </span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--fos-ink-2)' }}>
                {fmtLevel.split('·').slice(1).join('·').trim()}
              </span>
            </div>
            {score && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                {SCORE_DIMENSIONS.map((d) => (
                  <Tag key={d.key} label={`${d.label} ${score[d.key]}`} tone={score[d.key] >= 6 ? 'accent' : 'neutral'} />
                ))}
              </div>
            )}
          </Panel>

          {/* Top repeated mistakes */}
          <Panel title="Top repeated mistakes" action={mistakes.length ? <button onClick={() => navigate('/errors')} style={linkBtn}>View all →</button> : undefined}>
            {repeated.length === 0 ? (
              <Empty text="No mistakes logged yet. They'll appear here as you practice — repeated ones rise to the top." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {repeated.map((r, i) => (
                  <div
                    key={r.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 0',
                      borderTop: i === 0 ? 'none' : '1px solid var(--fos-rule)',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fos-ink-3)', width: 20 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--fos-ink)' }}>
                      “{r.label}”
                    </span>
                    {r.count > 1 && <Tag label={`×${r.count}`} tone="mistake" />}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Right column — next recommended practice */}
        <div
          style={{
            backgroundColor: 'var(--fos-surface-1)',
            border: '1px solid var(--fos-accent-muted)',
            borderRadius: 4,
            padding: 24,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fos-accent)', marginBottom: 16 }}>
            Next recommended practice
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 21, fontWeight: 500, color: 'var(--fos-ink)', margin: '0 0 10px', lineHeight: 1.25 }}>
            {recommended.scenario.title}
          </h3>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--fos-ink-2)', margin: '0 0 18px', lineHeight: 1.55 }}>
            {recommended.reason}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
            <Tag label={CATEGORY_LABEL[recommended.scenario.category]} tone="neutral" />
            <Tag label={INTENSITY_LABEL[recommended.scenario.intensity]} tone="accent" dot />
          </div>
          <Button variant="primary" size="md" style={{ width: '100%' }} onClick={() => navigate(`/practice/${recommended.scenario.id}`)}>
            Practice this →
          </Button>
        </div>
      </div>
    </Page>
  )
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 19) return 'Good afternoon'
  return 'Good evening'
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: 'var(--fos-surface-1)', border: '1px solid var(--fos-border)', borderRadius: 4, padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--fos-ink-3)' }}>
          {title}
        </span>
        {action}
      </div>
      {children}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fos-ink-3)', lineHeight: 1.6, margin: 0 }}>{text}</p>
  )
}

const linkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--fos-accent)',
  padding: 0,
}
