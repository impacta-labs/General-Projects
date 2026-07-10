// Voice-first helpers: browser Speech Recognition (input) + Speech Synthesis (coach voice).
// Both degrade gracefully — the UI always offers a text fallback.

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Speech recognition (voice input) ─────────────────────────────────────────

export function speechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
}

export interface Recognizer {
  start: () => void
  stop: () => void
}

interface RecognizerCallbacks {
  onPartial?: (text: string) => void
  onFinal: (text: string) => void
  onError?: (err: string) => void
  onEnd?: () => void
}

export function createRecognizer(cb: RecognizerCallbacks): Recognizer | null {
  const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!Ctor) return null

  const rec = new Ctor()
  rec.lang = 'en-US'
  rec.interimResults = true
  // Keep listening through natural pauses — the speaker decides when to stop.
  rec.continuous = true
  rec.maxAlternatives = 1

  rec.onresult = (event: any) => {
    let interim = ''
    let final = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const chunk = event.results[i]
      if (chunk.isFinal) final += chunk[0].transcript
      else interim += chunk[0].transcript
    }
    if (interim && cb.onPartial) cb.onPartial(interim)
    if (final) cb.onFinal(final.trim())
  }
  rec.onerror = (e: any) => cb.onError?.(e?.error || 'speech-error')
  rec.onend = () => cb.onEnd?.()

  return {
    start: () => {
      try { rec.start() } catch { /* already started */ }
    },
    stop: () => {
      try { rec.stop() } catch { /* already stopped */ }
    },
  }
}

// ── Speech synthesis (the coach speaks) ──────────────────────────────────────

export function speechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

let cachedVoice: SpeechSynthesisVoice | null = null

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  // Prefer a natural en-GB / en-US voice
  const preferred =
    voices.find((v) => /en-GB/i.test(v.lang) && /female|natural|google/i.test(v.name)) ||
    voices.find((v) => /en-US/i.test(v.lang) && /natural|google|samantha/i.test(v.name)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null
  cachedVoice = preferred
  return preferred
}

export function speak(text: string, opts?: { rate?: number; onEnd?: () => void }): void {
  if (!speechSynthesisSupported() || !text) {
    opts?.onEnd?.()
    return
  }
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'en-US'
  utter.rate = opts?.rate ?? 0.96 // a touch slow — calm, clear
  utter.pitch = 1
  const voice = pickEnglishVoice()
  if (voice) utter.voice = voice
  if (opts?.onEnd) utter.onend = () => opts.onEnd?.()
  window.speechSynthesis.speak(utter)
}

export function stopSpeaking(): void {
  if (speechSynthesisSupported()) window.speechSynthesis.cancel()
}

// Warm up the voice list (some browsers load them async)
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null
    pickEnglishVoice()
  }
}
