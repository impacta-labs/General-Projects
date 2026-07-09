import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, Tag, Button } from '../components'
import { EmptyState } from './ErrorLog'
import { useAppStore } from '../store/app'
import { speak, speechSynthesisSupported } from '../lib/voice'
import type { Confidence } from '../types'

const CONFIDENCE_LABEL: Record<Confidence, string> = { 1: 'Shaky', 2: 'Getting there', 3: 'Solid' }
const CONFIDENCE_TONE: Record<Confidence, 'mistake' | 'warm' | 'accent'> = { 1: 'mistake', 2: 'warm', 3: 'accent' }

export default function PhraseBank() {
  const navigate = useNavigate()
  const { phrases, removePhrase, setPhraseConfidence, addPhrase } = useAppStore()
  const tts = speechSynthesisSupported()
  const [adding, setAdding] = useState(false)

  return (
    <Page
      eyebrow="Phrase Bank"
      title="Language you own"
      intro="The phrases here are yours to reach for in a meeting or on stage. Mark how confident you feel with each — and drill the shaky ones out loud until they're solid."
      actions={<Button variant="warm" onClick={() => setAdding((a) => !a)}>{adding ? 'Close' : '+ Add phrase'}</Button>}
    >
      {adding && <AddPhraseForm onAdd={(p) => { addPhrase(p); setAdding(false) }} onCancel={() => setAdding(false)} />}

      {phrases.length === 0 && !adding ? (
        <EmptyState
          title="Your phrase bank is empty"
          body="In the Practice Room, tap “Save phrase” on any correction to collect it here — or add your own with the button above."
          cta={() => navigate('/practice')}
        />
      ) : (
        <div className="fos-col-2" style={{ gap: 14, alignItems: 'start' }}>
          {phrases.map((p) => (
            <div key={p.id} style={{ backgroundColor: 'var(--fos-surface-1)', border: '1px solid var(--fos-border)', borderRadius: 4, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 500, color: 'var(--fos-ink)', lineHeight: 1.3 }}>
                      “{p.english}”
                    </span>
                    {tts && <button onClick={() => speak(p.english)} title="Hear it" style={playBtn}>▶</button>}
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--fos-accent-strong)', marginTop: 3 }}>{p.spanish}</div>
                </div>
                <button onClick={() => removePhrase(p.id)} title="Delete" style={delBtn}>✕</button>
              </div>

              {p.situation && (
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--fos-ink-2)' }}>
                  <span style={{ color: 'var(--fos-ink-3)' }}>When — </span>{p.situation}
                </div>
              )}
              {p.example && (
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fos-ink)', fontStyle: 'italic', borderLeft: '2px solid var(--fos-rule-strong)', paddingLeft: 12, lineHeight: 1.5 }}>
                  {p.example}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 2 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fos-ink-3)' }}>Confidence</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {([1, 2, 3] as Confidence[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setPhraseConfidence(p.id, c)}
                      title={CONFIDENCE_LABEL[c]}
                      style={{
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        opacity: p.confidence >= c ? 1 : 0.28,
                      }}
                    >
                      <Tag label={p.confidence === c ? CONFIDENCE_LABEL[c] : `${c}`} tone={CONFIDENCE_TONE[p.confidence]} dot={p.confidence === c} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  )
}

function AddPhraseForm({ onAdd, onCancel }: { onAdd: (p: { english: string; spanish: string; situation: string; example: string; confidence: Confidence }) => void; onCancel: () => void }) {
  const [english, setEnglish] = useState('')
  const [spanish, setSpanish] = useState('')
  const [situation, setSituation] = useState('')
  const [example, setExample] = useState('')

  return (
    <div style={{ backgroundColor: 'var(--fos-surface-1)', border: '1px solid var(--fos-accent-muted)', borderRadius: 4, padding: 20, marginBottom: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Input label="Phrase in English" value={english} onChange={setEnglish} placeholder="Let me walk you through it" />
      <Input label="Spanish meaning" value={spanish} onChange={setSpanish} placeholder="Déjame explicártelo paso a paso" />
      <Input label="Situation" value={situation} onChange={setSituation} placeholder="Starting a demo or explanation" />
      <Input label="Example" value={example} onChange={setExample} placeholder="Let me walk you through how it works." />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
        <Button variant="quiet" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="sm" disabled={!english.trim()} onClick={() => onAdd({ english: english.trim(), spanish: spanish.trim(), situation: situation.trim(), example: example.trim(), confidence: 1 })}>
          Add to bank
        </Button>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fos-ink-3)' }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          backgroundColor: 'var(--fos-surface-3)',
          border: '1px solid var(--fos-border-strong)',
          borderRadius: 3,
          color: 'var(--fos-ink)',
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          padding: '9px 12px',
          outline: 'none',
        }}
      />
    </label>
  )
}

const delBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fos-ink-3)', fontSize: 12, padding: 0, flexShrink: 0 }
const playBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fos-ink-3)', fontSize: 11, padding: 0 }
