export interface CaptionCue {
  start: number
  end: number
  text: string
}

export function splitIntoSentences(text: string): string[] {
  return text
    .match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) ?? [text.trim()]
}

export function buildProportionalCues(
  sentences: string[],
  durationSec: number,
  leadInSec = 0,
): CaptionCue[] {
  if (sentences.length === 0) {
    return []
  }

  const availableDuration = Math.max(0, durationSec - leadInSec)
  const totalWeight = sentences.reduce((sum, sentence) => sum + sentence.length, 0)

  let cursor = leadInSec
  return sentences.map((sentence) => {
    const weight = sentence.length / totalWeight
    const cueDuration = weight * availableDuration
    const cue: CaptionCue = {
      start: cursor,
      end: cursor + cueDuration,
      text: sentence,
    }
    cursor += cueDuration
    return cue
  })
}

export function getActiveCueText(cues: CaptionCue[], timeSec: number): string | null {
  const activeCue = cues.find((cue) => timeSec >= cue.start && timeSec < cue.end)
  return activeCue?.text ?? null
}
