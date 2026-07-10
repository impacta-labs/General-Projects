import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useIsMobile } from '../hooks/useViewport'
import { Button, Tag, ScoreBar } from '../components'
import MicButton from '../components/primitives/MicButton'
import { SCENARIOS, getScenario, INTENSITY_LABEL, CATEGORY_LABEL } from '../data/scenarios'
import { SCORE_DIMENSIONS } from '../tokens'
import type { ChatTurn, CoachFeedback, ScoreSet, Scenario } from '../types'
import { coach, scoreSession } from '../lib/coach'
import { speak, stopSpeaking, speechSynthesisSupported } from '../lib/voice'
import { useDictation } from '../hooks/useDictation'
import { useAppStore } from '../store/app'

function uid() {
  return `t-${Date.now()}-${Math.round(Math.random() * 1e6)}`
}

export default function PracticeRoom() {
  const { scenarioId } = useParams()
  const scenario = scenarioId ? getScenario(scenarioId) : undefined

  if (!scenario) return <ScenarioChooser />
  return <Conversation key={scenario.id} scenario={scenario} />
}

// ── Scenario chooser ─────────────────────────────────────────────────────────

function ScenarioChooser() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  return (
    <div style={{ width: '100%', maxWidth: 1080, margin: '0 auto', padding: isMobile ? '28px 18px 72px' : '48px 40px 96px', animation: 'fos-fade-up 0.4s ease both' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fos-accent)', marginBottom: 10 }}>
        Practice Room
      </div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? 26 : 34, fontWeight: 500, color: 'var(--fos-ink)', margin: '0 0 10px' }}>
        Choose a situation to practice
      </h1>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--fos-ink-2)', maxWidth: 620, margin: '0 0 30px', lineHeight: 1.6 }}>
        Pick a real moment. Your coach will play the other person, speak with you, and after each answer give you a calmer, stronger way to say it.
      </p>
      <div className="fos-col-3" style={{ gap: 14 }}>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => navigate(`/practice/${s.id}`)}
            style={{
              textAlign: 'left',
              backgroundColor: 'var(--fos-surface-1)',
              border: '1px solid var(--fos-border)',
              borderRadius: 4,
              padding: 20,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              transition: 'border-color 0.16s ease, background-color 0.16s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--fos-accent-muted)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--fos-border)' }}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag label={CATEGORY_LABEL[s.category]} tone="neutral" />
              <Tag label={INTENSITY_LABEL[s.intensity]} tone="accent" dot />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, color: 'var(--fos-ink)', margin: 0, lineHeight: 1.3 }}>
              {s.title}
            </h3>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fos-ink-2)', margin: 0, lineHeight: 1.5 }}>
              {s.brief}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Conversation ─────────────────────────────────────────────────────────────

function Conversation({ scenario }: { scenario: Scenario }) {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const completeSession = useAppStore((s) => s.completeSession)

  const [turns, setTurns] = useState<ChatTurn[]>(() => [
    { id: uid(), role: 'coach', text: scenario.opener },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [voiceOn, setVoiceOn] = useState(true)
  const [savedMistakes, setSavedMistakes] = useState<Set<string>>(new Set())
  const [savedPhrases, setSavedPhrases] = useState<Set<string>>(new Set())
  const [summary, setSummary] = useState<ScoreSet | null>(null)
  const [scoring, setScoring] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const dictation = useDictation((chunk) =>
    setInput((prev) => (prev.trim() ? prev.trim() + ' ' : '') + chunk)
  )
  const voiceSupported = dictation.supported
  const ttsSupported = speechSynthesisSupported()

  // Speak the coach's opening line once
  useEffect(() => {
    if (voiceOn && ttsSupported) speak(scenario.opener)
    return () => stopSpeaking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll to newest turn
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, thinking])

  const stats = useMemo(() => {
    const userTurns = turns.filter((t) => t.role === 'user').length
    return { userTurns, mistakes: savedMistakes.size, phrases: savedPhrases.size }
  }, [turns, savedMistakes, savedPhrases])

  async function submit(text: string) {
    const clean = text.trim()
    if (!clean || thinking) return
    dictation.stop()
    setInput('')

    const userTurn: ChatTurn = { id: uid(), role: 'user', text: clean }
    const history = [...turns]
    setTurns((prev) => [...prev, userTurn])
    setThinking(true)

    const feedback = await coach({ scenario, history, userText: clean })
    const coachTurn: ChatTurn = { id: uid(), role: 'coach', text: feedback.reply, feedback }
    setTurns((prev) => [...prev, coachTurn])
    setThinking(false)
    if (voiceOn && ttsSupported) speak(feedback.reply)
  }

  async function endSession() {
    stopSpeaking()
    dictation.stop()
    setScoring(true)
    const score = await scoreSession(scenario, turns)
    setScoring(false)
    setSummary(score)
  }

  function finishAndSave() {
    if (!summary) return
    completeSession({
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      turns: stats.userTurns,
      mistakesLogged: stats.mistakes,
      phrasesSaved: stats.phrases,
      score: summary,
    })
    navigate('/progress')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 52px)', minHeight: 0 }}>
      {/* Scenario header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          padding: isMobile ? '12px 16px' : '14px 32px',
          borderBottom: '1px solid var(--fos-rule)',
          backgroundColor: 'var(--fos-surface-1)',
          flexShrink: 0,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? 15 : 17, color: 'var(--fos-ink)', fontWeight: 500 }}>
              {scenario.title}
            </span>
            {!isMobile && <Tag label={INTENSITY_LABEL[scenario.intensity]} tone="accent" dot />}
          </div>
          {!isMobile && (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fos-ink-3)', marginTop: 3 }}>
              Goal — {scenario.goal} · {scenario.briefEs}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {ttsSupported && (
            <Button variant="quiet" size="sm" onClick={() => { if (voiceOn) stopSpeaking(); setVoiceOn((v) => !v) }} title="Coach voice">
              {voiceOn ? '🔊 Voice on' : '🔈 Voice off'}
            </Button>
          )}
          <Button variant="quiet" size="sm" onClick={() => navigate('/practice')}>Change</Button>
          <Button variant="ghost" size="sm" onClick={endSession} disabled={stats.userTurns === 0 || scoring}>
            {scoring ? 'Scoring…' : 'End session'}
          </Button>
        </div>
      </div>

      {/* Chat */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 16px' : '28px 32px', minHeight: 0 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
          {turns.map((t) =>
            t.role === 'coach' ? (
              <CoachTurn
                key={t.id}
                turn={t}
                scenario={scenario}
                userText={priorUserText(turns, t.id)}
                onRepeat={(line) => { if (ttsSupported) { stopSpeaking(); speak(line) } }}
                savedMistake={savedMistakes.has(t.id)}
                savedPhrase={savedPhrases.has(t.id)}
                onSaveMistake={() => setSavedMistakes((s) => new Set(s).add(t.id))}
                onSavePhrase={() => setSavedPhrases((s) => new Set(s).add(t.id))}
              />
            ) : (
              <UserTurn key={t.id} text={t.text} />
            )
          )}
          {thinking && <Thinking />}
        </div>
      </div>

      {/* Input bar */}
      <div
        style={{
          borderTop: '1px solid var(--fos-rule)',
          backgroundColor: 'var(--fos-surface-1)',
          padding: isMobile ? '14px 16px' : '18px 32px',
          flexShrink: 0,
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          {voiceSupported && (
            <MicButton listening={dictation.listening} onClick={dictation.toggle} disabled={thinking || dictation.busy} size={isMobile ? 56 : 64} />
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(dictation.listening || dictation.busy) && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--fos-accent)', textTransform: 'uppercase' }}>
                {dictation.busy
                  ? '⋯ Transcribing…'
                  : dictation.interim
                    ? `“${dictation.interim}”`
                    : dictation.mode === 'whisper'
                      ? '● Recording — speak your answer, then tap the mic to transcribe.'
                      : '● Recording — take your time. Tap the mic (or Send) when you\'re done.'}
              </span>
            )}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(input) }
                }}
                rows={1}
                placeholder={voiceSupported ? 'Speak, or type your answer here…' : 'Type your answer here…'}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--fos-surface-3)',
                  border: '1px solid var(--fos-border-strong)',
                  borderRadius: 4,
                  color: 'var(--fos-ink)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  padding: '11px 14px',
                  outline: 'none',
                  lineHeight: 1.5,
                  minHeight: 44,
                  maxHeight: 120,
                }}
              />
              <Button variant="primary" onClick={() => submit(input)} disabled={!input.trim() || thinking}>
                Send
              </Button>
            </div>
          </div>
        </div>
        {dictation.mode === 'none' && (
          <p style={{ maxWidth: 760, margin: '10px auto 0', fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fos-ink-3)' }}>
            Voice input isn't available in this browser — Chrome or Edge work best. You can still type every answer.
          </p>
        )}
      </div>

      {summary && (
        <SummaryModal
          scenario={scenario}
          score={summary}
          stats={stats}
          onClose={() => setSummary(null)}
          onSave={finishAndSave}
        />
      )}
    </div>
  )
}

function priorUserText(turns: ChatTurn[], coachId: string): string {
  const idx = turns.findIndex((t) => t.id === coachId)
  for (let i = idx - 1; i >= 0; i--) if (turns[i].role === 'user') return turns[i].text
  return ''
}

// ── Turn renderers ───────────────────────────────────────────────────────────

function UserTurn({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div
        style={{
          maxWidth: '80%',
          backgroundColor: 'var(--fos-surface-3)',
          border: '1px solid var(--fos-border)',
          borderRadius: '4px 4px 0 4px',
          padding: '12px 16px',
          fontFamily: 'var(--font-sans)',
          fontSize: 14.5,
          color: 'var(--fos-ink)',
          lineHeight: 1.55,
        }}
      >
        {text}
      </div>
    </div>
  )
}

function CoachTurn({
  turn, scenario, userText, onRepeat, savedMistake, savedPhrase, onSaveMistake, onSavePhrase,
}: {
  turn: ChatTurn
  scenario: Scenario
  userText: string
  onRepeat: (line: string) => void
  savedMistake: boolean
  savedPhrase: boolean
  onSaveMistake: () => void
  onSavePhrase: () => void
}) {
  const addMistake = useAppStore((s) => s.addMistake)
  const addPhrase = useAppStore((s) => s.addPhrase)
  const f = turn.feedback

  function saveMistake() {
    if (!f || savedMistake) return
    addMistake({
      original: userText || f.mainMistake,
      corrected: f.naturalVersion || f.founderVersion,
      explanationEs: f.explanationEs,
      example: f.founderVersion,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
    })
    onSaveMistake()
  }

  function savePhrase() {
    if (!f || savedPhrase) return
    addPhrase({
      english: f.phraseEnglish || f.founderVersion,
      spanish: f.phraseSpanish,
      situation: scenario.title,
      example: f.founderVersion,
      confidence: 1,
    })
    onSavePhrase()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', maxWidth: '92%' }}>
      {/* Coach speech bubble */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: 'var(--fos-accent-subtle)', border: '1px solid var(--fos-accent-muted)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
          <span style={{ fontSize: 11 }}>🎧</span>
        </div>
        <div
          style={{
            backgroundColor: 'var(--fos-surface-2)',
            border: '1px solid var(--fos-border)',
            borderRadius: '4px 4px 4px 0',
            padding: '12px 16px',
            fontFamily: 'var(--font-sans)',
            fontSize: 14.5,
            color: 'var(--fos-ink)',
            lineHeight: 1.55,
          }}
        >
          {turn.text}
          {f && (
            <button onClick={() => onRepeat(turn.text)} title="Hear it again" style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fos-ink-3)', fontSize: 12, padding: 0 }}>
              ↻
            </button>
          )}
        </div>
      </div>

      {/* Correction card */}
      {f && (f.mainMistake || f.naturalVersion || f.founderVersion) && (
        <CorrectionCard
          f={f}
          onRepeat={onRepeat}
          onSaveMistake={saveMistake}
          onSavePhrase={savePhrase}
          savedMistake={savedMistake}
          savedPhrase={savedPhrase}
        />
      )}
    </div>
  )
}

function CorrectionCard({
  f, onRepeat, onSaveMistake, onSavePhrase, savedMistake, savedPhrase,
}: {
  f: CoachFeedback
  onRepeat: (line: string) => void
  onSaveMistake: () => void
  onSavePhrase: () => void
  savedMistake: boolean
  savedPhrase: boolean
}) {
  const clean = !f.mainMistake
  return (
    <div
      style={{
        width: '100%',
        marginLeft: 38,
        maxWidth: 620,
        backgroundColor: 'var(--fos-surface-1)',
        border: `1px solid ${clean ? 'var(--fos-accent-muted)' : 'var(--fos-border-strong)'}`,
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--fos-rule)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: clean ? 'var(--fos-accent)' : 'var(--fos-mistake)' }}>
          {clean ? '✓ Clean answer' : 'Coach note'}
        </span>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {f.mainMistake && (
          <Row label="Main mistake" tone="mistake">
            <span style={{ color: 'var(--fos-mistake)' }}>{f.mainMistake}</span>
          </Row>
        )}
        {f.naturalVersion && (
          <Row label="Natural version">
            <Speakable text={f.naturalVersion} onRepeat={onRepeat} />
          </Row>
        )}
        {f.founderVersion && (
          <Row label="Founder-level version" tone="accent">
            <Speakable text={f.founderVersion} onRepeat={onRepeat} accent />
          </Row>
        )}
        {f.explanationEs && (
          <Row label="En español">
            <span style={{ color: 'var(--fos-ink-2)', fontStyle: 'italic' }}>{f.explanationEs}</span>
          </Row>
        )}
        <div className="fos-col-2" style={{ gap: 14 }}>
          {f.pronunciationTip && (
            <Row label="Pronunciation / rhythm">{f.pronunciationTip}</Row>
          )}
          {f.communicationTip && (
            <Row label="Communication">{f.communicationTip}</Row>
          )}
        </div>
        {f.repeatInstruction && (
          <div style={{ backgroundColor: 'var(--fos-accent-subtle)', border: '1px solid var(--fos-accent-muted)', borderRadius: 4, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fos-accent)', marginBottom: 4 }}>
                Repeat out loud
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--fos-ink)', lineHeight: 1.35 }}>
                “{f.repeatInstruction}”
              </div>
            </div>
            <Button variant="quiet" size="sm" onClick={() => onRepeat(f.repeatInstruction)} title="Hear it">▶</Button>
          </div>
        )}
      </div>

      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--fos-rule)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant={savedMistake ? 'quiet' : 'ghost'} size="sm" onClick={onSaveMistake} disabled={savedMistake || clean}>
          {savedMistake ? '✓ Saved to Error Log' : '+ Save mistake'}
        </Button>
        <Button variant={savedPhrase ? 'quiet' : 'warm'} size="sm" onClick={onSavePhrase} disabled={savedPhrase}>
          {savedPhrase ? '✓ Saved to Phrase Bank' : '+ Save phrase'}
        </Button>
      </div>
    </div>
  )
}

function Row({ label, tone, children }: { label: string; tone?: 'accent' | 'mistake'; children: React.ReactNode }) {
  const color = tone === 'accent' ? 'var(--fos-accent)' : tone === 'mistake' ? 'var(--fos-mistake)' : 'var(--fos-ink-3)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color }}>
        {label}
      </span>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--fos-ink)', lineHeight: 1.5 }}>{children}</div>
    </div>
  )
}

function Speakable({ text, onRepeat, accent }: { text: string; onRepeat: (t: string) => void; accent?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ color: accent ? 'var(--fos-accent-strong)' : 'var(--fos-ink)', fontWeight: accent ? 500 : 400 }}>{text}</span>
      <button onClick={() => onRepeat(text)} title="Hear it" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fos-ink-3)', fontSize: 11, padding: 0, flexShrink: 0 }}>▶</button>
    </span>
  )
}

function Thinking() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: 'var(--fos-accent-subtle)', border: '1px solid var(--fos-accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11 }}>🎧</span>
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fos-ink-3)', letterSpacing: '0.06em' }}>
        Coach is listening…
      </span>
    </div>
  )
}

// ── Session summary ──────────────────────────────────────────────────────────

function SummaryModal({
  scenario, score, stats, onClose, onSave,
}: {
  scenario: Scenario
  score: ScoreSet
  stats: { userTurns: number; mistakes: number; phrases: number }
  onClose: () => void
  onSave: () => void
}) {
  const avg = Object.values(score).reduce((a, b) => a + b, 0) / 7
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div style={{ backgroundColor: 'var(--fos-surface-2)', border: '1px solid var(--fos-border-strong)', borderRadius: 6, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}>
        <div style={{ padding: '24px 26px', borderBottom: '1px solid var(--fos-rule)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fos-accent)', marginBottom: 8 }}>
            Session complete
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 500, color: 'var(--fos-ink)', margin: 0 }}>
            {scenario.title}
          </h2>
          <div style={{ display: 'flex', gap: 18, marginTop: 14 }}>
            <MiniStat label="Answers" value={stats.userTurns} />
            <MiniStat label="Mistakes saved" value={stats.mistakes} />
            <MiniStat label="Phrases saved" value={stats.phrases} />
            <MiniStat label="Overall" value={avg.toFixed(1)} accent />
          </div>
        </div>
        <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {SCORE_DIMENSIONS.map((d) => (
            <ScoreBar key={d.key} label={d.label} value={score[d.key]} />
          ))}
        </div>
        <div style={{ padding: '16px 26px', borderTop: '1px solid var(--fos-rule)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="quiet" onClick={onClose}>Keep practising</Button>
          <Button variant="primary" onClick={onSave}>Save & finish</Button>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: accent ? 'var(--fos-accent)' : 'var(--fos-ink)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fos-ink-3)' }}>{label}</span>
    </div>
  )
}
