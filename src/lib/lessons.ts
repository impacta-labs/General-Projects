import type { DrillFeedback } from '../types'

/** Check a founder's attempt at a drill against the target sentence.
 *  Uses the AI coach when available; falls back to a local check. */
export async function checkDrill(
  targetEn: string,
  userText: string,
  promptEs: string
): Promise<DrillFeedback> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'checkDrill',
        params: { targetEn, userText, promptEs },
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { data } = await res.json()
    return {
      ok: Boolean(data?.ok),
      correctedEn: str(data?.correctedEn) || targetEn,
      feedbackEs: str(data?.feedbackEs) || '',
      tipEs: str(data?.tipEs) || '',
    }
  } catch {
    return localCheck(targetEn, userText)
  }
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

// ── Local drill check ────────────────────────────────────────────────────────
// Compares the attempt to the target by content-word overlap. Not as sharp as
// the AI, but gives honest, encouraging feedback offline.

function normalize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/\[.*?\]/g, ' ') // drop [placeholders]
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

const STOP = new Set(['a', 'an', 'the', 'to', 'of', 'in', 'on', 'for', 'and', 'is', 'are', 'i', 'we', 'you', 'it', "i'm", 'my', 'our'])

function localCheck(targetEn: string, userText: string): DrillFeedback {
  const target = normalize(targetEn).filter((w) => !STOP.has(w))
  const said = new Set(normalize(userText))
  if (target.length === 0) {
    return { ok: true, correctedEn: targetEn, feedbackEs: '¡Bien! Sigue practicando en voz alta.', tipEs: '' }
  }
  const hits = target.filter((w) => said.has(w)).length
  const ratio = hits / target.length

  if (ratio >= 0.7) {
    return {
      ok: true,
      correctedEn: targetEn,
      feedbackEs: '¡Muy bien! Lo has dicho de forma natural. Repítelo una vez más en voz alta para fijarlo.',
      tipEs: '',
    }
  }
  if (ratio >= 0.4) {
    return {
      ok: false,
      correctedEn: targetEn,
      feedbackEs: 'Casi. Vas por buen camino, pero fíjate en el modelo y vuelve a intentarlo prestando atención a las palabras que faltan.',
      tipEs: 'Di la frase entera de un tirón, sin pararte a medio camino.',
    }
  }
  return {
    ok: false,
    correctedEn: targetEn,
    feedbackEs: 'Vamos a afinarlo. Lee el modelo de abajo en voz alta 2 o 3 veces y vuelve a intentarlo. No pasa nada — así se aprende.',
    tipEs: 'Escucha el audio del modelo (▶) y copia el ritmo.',
  }
}
