import { useNavigate } from 'react-router-dom'
import { Page, Tag, Button } from '../components'
import { SCENARIOS, INTENSITY_LABEL, CATEGORY_LABEL } from '../data/scenarios'
import { useAppStore } from '../store/app'

export default function ScenarioLibrary() {
  const navigate = useNavigate()
  const sessions = useAppStore((s) => s.sessions)

  function timesPracticed(id: string) {
    return sessions.filter((s) => s.scenarioId === id).length
  }

  return (
    <Page
      eyebrow="Scenario Library"
      title="Real situations, one at a time"
      intro="Every scenario is a real moment a founder faces in English. Start with a warm-up, then work up to the harder rooms — pitches, tough questions, the stage."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {SCENARIOS.map((s) => {
          const count = timesPracticed(s.id)
          return (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '18px 22px',
                backgroundColor: 'var(--fos-surface-1)',
                border: '1px solid var(--fos-border)',
                borderRadius: 4,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <Tag label={CATEGORY_LABEL[s.category]} tone="neutral" />
                  <Tag label={INTENSITY_LABEL[s.intensity]} tone="accent" dot />
                  {count > 0 && <Tag label={`Practised ×${count}`} tone="warm" />}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 500, color: 'var(--fos-ink)', margin: '0 0 5px', lineHeight: 1.3 }}>
                  {s.title}
                </h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--fos-ink-2)', margin: 0, lineHeight: 1.5 }}>
                  {s.brief}
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--fos-ink-3)', margin: '4px 0 0', lineHeight: 1.5 }}>
                  {s.briefEs}
                </p>
              </div>
              <Button variant="ghost" onClick={() => navigate(`/practice/${s.id}`)} style={{ flexShrink: 0 }}>
                Practice →
              </Button>
            </div>
          )
        })}
      </div>
    </Page>
  )
}
