import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createRecognizer,
  speechRecognitionSupported,
  whisperAvailable,
  startRecording,
  stopSpeaking,
  type Recognizer,
  type AudioRecorder,
} from '../lib/voice'

type Mode = 'unknown' | 'whisper' | 'browser' | 'none'

/**
 * One voice-input hook for the whole app. Prefers server-side Whisper
 * (accurate with a Spanish accent) and falls back to the browser recognizer.
 * `onText` receives each recognized chunk to append into an input box.
 */
export function useDictation(onText: (chunk: string) => void) {
  const [mode, setMode] = useState<Mode>('unknown')
  const [listening, setListening] = useState(false)
  const [busy, setBusy] = useState(false) // transcribing (whisper)
  const [interim, setInterim] = useState('')

  const recRef = useRef<Recognizer | null>(null)
  const recorderRef = useRef<AudioRecorder | null>(null)
  const wantRef = useRef(false)
  const onTextRef = useRef(onText)
  useEffect(() => { onTextRef.current = onText }, [onText])

  useEffect(() => {
    let alive = true
    ;(async () => {
      if (await whisperAvailable()) { if (alive) setMode('whisper'); return }
      if (alive) setMode(speechRecognitionSupported() ? 'browser' : 'none')
    })()
    return () => { alive = false }
  }, [])

  const stop = useCallback(() => {
    wantRef.current = false
    recRef.current?.stop()
    setListening(false)
    setInterim('')
  }, [])

  const toggle = useCallback(async () => {
    stopSpeaking()

    if (mode === 'browser') {
      if (listening) { stop(); return }
      wantRef.current = true
      const rec = createRecognizer({
        onPartial: (t) => setInterim(t),
        onFinal: (chunk) => { setInterim(''); onTextRef.current(chunk) },
        onError: (err) => {
          if (err === 'not-allowed' || err === 'service-not-allowed') {
            wantRef.current = false; setListening(false); setInterim('')
          }
        },
        onEnd: () => {
          if (wantRef.current) { try { recRef.current?.start() } catch { /* noop */ } }
          else setListening(false)
        },
      })
      if (!rec) return
      recRef.current = rec
      setListening(true)
      rec.start()
      return
    }

    if (mode === 'whisper') {
      if (listening) {
        setListening(false)
        setBusy(true)
        try {
          const text = await recorderRef.current?.stopAndTranscribe()
          if (text) onTextRef.current(text)
        } catch { /* transcription failed — user can type */ }
        setBusy(false)
        recorderRef.current = null
        return
      }
      try {
        recorderRef.current = await startRecording()
        setListening(true)
      } catch { /* mic permission denied */ }
    }
  }, [mode, listening, stop])

  // Cleanup on unmount
  useEffect(() => () => {
    wantRef.current = false
    recRef.current?.stop()
    recorderRef.current?.cancel()
  }, [])

  return {
    supported: mode === 'whisper' || mode === 'browser',
    mode,
    listening,
    busy,
    interim,
    toggle,
    stop,
  }
}
