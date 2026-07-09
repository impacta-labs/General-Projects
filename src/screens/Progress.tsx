import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Page, ScoreBar, Button, Tag } from '../components'
import { EmptyState } from './ErrorLog'
import { useAppStore, latestScore, averageScore } from '../store/app'
import { SCORE_DIMENSIONS } from '../tokens'

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export default function Progress() {
  const navigate = useNavigate()
  const { scores, sessions, resetAll } = useAppStore()
  const [confirmReset, setConfirmReset] = useState(false)

  const current = useMemo(() => latestScore(scores), [scores])
  const avg = averageScore(current)

  // First → latest delta per dimension
  const firstScore = useMemo(() => {
    if (!scores.length) return null
    const sorted = [...scores].sort((a, b) => a.date.localeCompare(b.date))
    return sorted[0]
  }, [scores])

  const trend = useMemo(() => {
    return [...scores]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((s) => ({
        date: fmtDate(s.date),
        overall: Number(
          ((s.fluency + s.clarity + s.grammar + s.vocabulary + s.pronunciation + s.confidence + s.founderPresence) / 7).toFixed(1)
        ),
      }))
  }, [scores])

  return (
    <Page
      eyebrow="Progress"
      title="How your voice is growing"
      intro="Seven dimensions, scored from 1 to 10 after each session. Watch the shaky ones climb. Calm and confident is the destination — not perfect grammar."
      actions={
        scores.length > 0 ? (
          confirmReset ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="quiet" size="sm" onClick={() => setConfirmReset(false)}>Cancel</Button>
              <Button variant="ghost" size="sm" onClick={() => { resetAll(); setConfirmReset(false) }}>Confirm reset</Button>
            </div>
          ) : (
            <Button variant="quiet" size="sm" onClick={() => setConfirmReset(true)}>Reset all data</Button>
          )
        ) : undefined
      }
    >
      {scores.length === 0 ? (
        <EmptyState
          title="No scores yet"
          body="Finish a session in the Practice Room and your coach will score your spoken English across all seven dimensions. Your progress will grow here."
          cta={() => navigate('/practice')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Headline */}
          <div className="fos-col-2" style={{ gap: 20, alignItems: 'stretch' }}>
            <div style={{ backgroundColor: 'var(--fos-surface-1)', border: '1px solid var(--fos-accent-muted)', borderRadius: 4, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fos-accent)', marginBottom: 10 }}>Overall right now</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 56, fontWeight: 500, color: 'var(--fos-ink)', lineHeight: 1 }}>{avg.toFixed(1)}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--fos-ink-3)' }}>/ 10</span>
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 16 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fos-ink-2)' }}>{sessions.length} sessions</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fos-ink-2)' }}>·</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fos-ink-2)' }}>{scores.length} scored</span>
              </div>
            </div>

            {/* Trend chart */}
            <div style={{ backgroundColor: 'var(--fos-surface-1)', border: '1px solid var(--fos-border)', borderRadius: 4, padding: '20px 20px 12px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--fos-ink-3)' }}>Overall over time</span>
              <div style={{ height: 160, marginTop: 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--fos-rule)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#565E60', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={{ stroke: 'var(--fos-rule)' }} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#565E60', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#14171B', border: '1px solid #2E343D', borderRadius: 4, fontFamily: 'IBM Plex Mono', fontSize: 11 }}
                      labelStyle={{ color: '#98A0A0' }}
                      itemStyle={{ color: '#82B3A4' }}
                    />
                    <Line type="monotone" dataKey="overall" stroke="#82B3A4" strokeWidth={2} dot={{ fill: '#82B3A4', r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Dimension bars */}
          <div style={{ backgroundColor: 'var(--fos-surface-1)', border: '1px solid var(--fos-border)', borderRadius: 4, padding: 24 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--fos-ink-3)' }}>Skills — latest session</span>
            <div className="fos-col-2" style={{ gap: '18px 40px', marginTop: 18 }}>
              {SCORE_DIMENSIONS.map((d) => {
                const val = current ? current[d.key] : 0
                const delta = firstScore ? val - firstScore[d.key] : 0
                return (
                  <ScoreBar
                    key={d.key}
                    label={d.label}
                    value={val}
                    sublabel={
                      firstScore && sessions.length > 1
                        ? delta === 0 ? 'no change yet' : `${delta > 0 ? '▲' : '▼'} ${Math.abs(delta)} since your first session · ${d.es}`
                        : d.es
                    }
                  />
                )
              })}
            </div>
          </div>

          {/* Session history */}
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--fos-ink-3)', display: 'block', marginBottom: 12 }}>
              Session history
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sessions.map((s) => {
                const sAvg = s.score ? Object.values(s.score).reduce((a, b) => a + b, 0) / 7 : null
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 18px', backgroundColor: 'var(--fos-surface-1)', border: '1px solid var(--fos-border)', borderRadius: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fos-ink-3)', width: 56, flexShrink: 0 }}>{fmtDate(s.date)}</span>
                    <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--fos-ink)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.scenarioTitle}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fos-ink-3)' }}>{s.turns} answers</span>
                    {sAvg !== null && <Tag label={`${sAvg.toFixed(1)} / 10`} tone={sAvg >= 6 ? 'accent' : 'warm'} />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </Page>
  )
}
