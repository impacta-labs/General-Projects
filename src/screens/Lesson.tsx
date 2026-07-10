import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useIsMobile } from '../hooks/useViewport'
import { Page, Button, Tag } from '../components'
import MicButton from '../components/primitives/MicButton'
import { getLessonById, CURRICULUM } from '../data/curriculum'
import { useAppStore } from '../store/app'
import { checkDrill } from '../lib/lessons'
import { speak, stopSpeaking, speechSynthesisSupported, createRecognizer, speechRecognitionSupported, type Recognizer } from '../lib/voice'
import type { DrillFeedback, LessonPhrase } from '../types'

export default function Lesson() {
  const { id } = useParams()
  const navigate = useNavigate()
  const lesson = id ? getLessonById(id) : undefined
  const { addPhrase, markLessonComplete, completedLessons } = useAppStore()
  const [savedPhrases, setSavedPhrases] = useState<Set<string>>(new Set())
  const tts = speechSynthesisSupported()

  const nextId = useMemo(() => {
    if (!lesson) return CURRICULUM[0].id
    const idx = CURRICULUM.findIndex((l) => l.id === lesson.id)
    return CURRICULUM[(idx + 1) % CURRICULUM.length].id
  }, [lesson])

  if (!lesson) {
    return (
      <Page eyebrow="Learn" title="Lesson not found">
        <Button variant="primary" onClick={() => navigate('/learn')}>← Back to lessons</Button>
      </Page>
    )
  }

  function savePhrase(p: LessonPhrase, key: string) {
    addPhrase({ english: p.en, spanish: p.es, situation: lesson!.titleEs, example: p.example, confidence: 1 })
    setSavedPhrases((s) => new Set(s).add(key))
  }

  function saveAllPhrases() {
    lesson!.phrases.forEach((p, i) => {
      const key = `${lesson!.id}-${i}`
      if (!savedPhrases.has(key)) savePhrase(p, key)
    })
  }

  const isDone = completedLessons.includes(lesson.id)

  return (
    <Page
      eyebrow="Lesson"
      title={lesson.titleEs}
      intro={lesson.goalEs}
      actions={<Button variant="quiet" onClick={() => navigate('/learn')}>← All lessons</Button>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* 1 — Concept */}
        <Card step="1" label="La lección">
          <p style={{ ...bodyText, marginTop: 0 }}>{lesson.conceptEs}</p>
          <div style={{ backgroundColor: 'var(--fos-accent-subtle)', border: '1px solid var(--fos-accent-muted)', borderRadius: 4, padding: '12px 14px', marginTop: 6 }}>
            <span style={miniLabel}>Por qué importa</span>
            <p style={{ ...bodyText, margin: '4px 0 0', color: 'var(--fos-ink)' }}>{lesson.whyEs}</p>
          </div>
        </Card>

        {/* 2 — Key phrases */}
        <Card
          step="2"
          label="Frases clave"
          action={<Button variant="warm" size="sm" onClick={saveAllPhrases}>Guardar todas</Button>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lesson.phrases.map((p, i) => {
              const key = `${lesson.id}-${i}`
              const saved = savedPhrases.has(key)
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderTop: i === 0 ? 'none' : '1px solid var(--fos-rule)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--fos-ink)' }}>{p.en}</span>
                      {tts && <button onClick={() => speak(p.en)} title="Escúchalo" style={playBtn}>▶</button>}
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--fos-accent-strong)', marginTop: 2 }}>{p.es}</div>
                    {p.example && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--fos-ink-3)', fontStyle: 'italic', marginTop: 3 }}>“{p.example}”</div>}
                  </div>
                  <Button variant={saved ? 'quiet' : 'ghost'} size="sm" disabled={saved} onClick={() => savePhrase(p, key)} style={{ flexShrink: 0 }}>
                    {saved ? '✓' : '+ Banco'}
                  </Button>
                </div>
              )
            })}
          </div>
        </Card>

        {/* 3 — Drills */}
        <Card step="3" label="Practica en voz alta">
          <p style={{ ...bodyText, marginTop: 0, marginBottom: 16 }}>
            Di cada frase en inglés. Tu coach te dirá si suena natural y cómo mejorarla. Usa el micrófono o escribe.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lesson.drills.map((d, i) => (
              <DrillCard key={i} index={i} promptEs={d.promptEs} targetEn={d.targetEn} tipEs={d.tipEs} />
            ))}
          </div>
        </Card>

        {/* Complete */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', paddingTop: 6 }}>
          <div>
            {isDone
              ? <Tag label="✓ Lección completada" tone="accent" dot />
              : <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fos-ink-2)' }}>¿Terminaste? Márcala como completada.</span>}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {!isDone && <Button variant="ghost" onClick={() => markLessonComplete(lesson.id)}>Marcar completada</Button>}
            <Button variant="primary" onClick={() => { markLessonComplete(lesson.id); stopSpeaking(); navigate(`/learn/${nextId}`) }}>
              Siguiente lección →
            </Button>
          </div>
        </div>
      </div>
    </Page>
  )
}

// ── Drill card ───────────────────────────────────────────────────────────────

function DrillCard({ index, promptEs, targetEn, tipEs }: { index: number; promptEs: string; targetEn: string; tipEs: string }) {
  const isMobile = useIsMobile()
  const [input, setInput] = useState('')
  const [interim, setInterim] = useState('')
  const [listening, setListening] = useState(false)
  const [checking, setChecking] = useState(false)
  const [feedback, setFeedback] = useState<DrillFeedback | null>(null)
  const recRef = useRef<Recognizer | null>(null)
  const wantRef = useRef(false)
  const voiceSupported = speechRecognitionSupported()
  const tts = speechSynthesisSupported()

  function stopListening() {
    wantRef.current = false
    recRef.current?.stop()
    setListening(false)
    setInterim('')
  }

  function toggleListening() {
    if (listening) { stopListening(); return }
    stopSpeaking()
    wantRef.current = true
    const rec = createRecognizer({
      onPartial: (t) => setInterim(t),
      onFinal: (chunk) => { setInterim(''); setInput((prev) => (prev.trim() ? prev.trim() + ' ' : '') + chunk) },
      onError: (err) => { if (err === 'not-allowed' || err === 'service-not-allowed') { wantRef.current = false; setListening(false); setInterim('') } },
      onEnd: () => { if (wantRef.current) { try { recRef.current?.start() } catch { /* noop */ } } else setListening(false) },
    })
    if (!rec) return
    recRef.current = rec
    setListening(true)
    rec.start()
  }

  async function check() {
    if (!input.trim() || checking) return
    stopListening()
    setChecking(true)
    const fb = await checkDrill(targetEn, input, promptEs)
    setFeedback(fb)
    setChecking(false)
  }

  return (
    <div style={{ backgroundColor: 'var(--fos-surface-2)', border: '1px solid var(--fos-border)', borderRadius: 4, padding: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fos-ink-3)' }}>{String(index + 1).padStart(2, '0')}</span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, color: 'var(--fos-ink)' }}>{promptEs}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        {voiceSupported && <MicButton listening={listening} onClick={toggleListening} disabled={checking} size={isMobile ? 44 : 48} />}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {listening && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.06em', color: 'var(--fos-accent)', textTransform: 'uppercase' }}>
              {interim ? `“${interim}”` : '● Grabando — pulsa el micro al terminar'}
            </span>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); check() } }}
            placeholder="Di o escribe tu respuesta en inglés…"
            style={{ backgroundColor: 'var(--fos-surface-3)', border: '1px solid var(--fos-border-strong)', borderRadius: 4, color: 'var(--fos-ink)', fontFamily: 'var(--font-sans)', fontSize: 14, padding: '10px 12px', outline: 'none' }}
          />
        </div>
        <Button variant="primary" size="sm" onClick={check} disabled={!input.trim() || checking}>
          {checking ? '…' : 'Check'}
        </Button>
      </div>

      {feedback && (
        <div style={{ marginTop: 12, borderTop: '1px solid var(--fos-rule)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag label={feedback.ok ? '✓ ¡Bien!' : 'Casi — inténtalo otra vez'} tone={feedback.ok ? 'accent' : 'mistake'} />
          </div>
          <p style={{ ...bodyText, margin: 0, color: 'var(--fos-ink-2)', fontStyle: 'italic' }}>{feedback.feedbackEs}</p>
          <div>
            <span style={miniLabel}>Modelo</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 3 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--fos-accent-strong)' }}>{feedback.correctedEn}</span>
              {tts && <button onClick={() => speak(feedback.correctedEn)} title="Escúchalo" style={playBtn}>▶</button>}
            </div>
          </div>
          {(feedback.tipEs || tipEs) && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--fos-ink-3)', margin: 0 }}>
              💡 {feedback.tipEs || tipEs}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── bits ─────────────────────────────────────────────────────────────────────

function Card({ step, label, action, children }: { step: string; label: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: 'var(--fos-surface-1)', border: '1px solid var(--fos-border)', borderRadius: 4, padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fos-bg)', backgroundColor: 'var(--fos-accent)', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{step}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--fos-ink-3)' }}>{label}</span>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

const bodyText: React.CSSProperties = { fontFamily: 'var(--font-sans)', fontSize: 14.5, color: 'var(--fos-ink)', lineHeight: 1.6 }
const miniLabel: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fos-ink-3)' }
const playBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fos-ink-3)', fontSize: 11, padding: 0 }
