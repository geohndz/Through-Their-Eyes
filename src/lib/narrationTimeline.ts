import type { NarrationSet } from '../types/narration'

export interface TimelineSegment {
  type: 'wait' | 'audio'
  durationMs: number
  trackIndex?: number
}

export function loadAudioDurationMs(src: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.src = src

    const finish = (durationMs: number) => {
      audio.src = ''
      resolve(durationMs)
    }

    audio.addEventListener(
      'loadedmetadata',
      () => {
        finish(Number.isFinite(audio.duration) ? audio.duration * 1000 : 0)
      },
      { once: true },
    )
    audio.addEventListener('error', () => finish(0), { once: true })
  })
}

export async function buildNarrationTimeline(
  narration: NarrationSet,
): Promise<{ segments: TimelineSegment[]; totalDurationMs: number }> {
  const segments: TimelineSegment[] = []
  let totalDurationMs = 0

  for (let trackIndex = 0; trackIndex < narration.tracks.length; trackIndex++) {
    const track = narration.tracks[trackIndex]

    segments.push({ type: 'wait', durationMs: track.delayBeforeMs })
    totalDurationMs += track.delayBeforeMs

    const durationMs = await loadAudioDurationMs(track.src)
    segments.push({ type: 'audio', durationMs, trackIndex })
    totalDurationMs += durationMs
  }

  return { segments, totalDurationMs }
}

export function getElapsedMsInSegment(
  segment: TimelineSegment,
  playbackState: 'waiting' | 'playing' | 'paused',
  waitRemainingMs: number,
  waitStartedAt: number,
  audioCurrentTimeSec: number,
): number {
  if (segment.type === 'wait') {
    const elapsedInWait = segment.durationMs - waitRemainingMs
    if (playbackState === 'waiting') {
      return Math.min(segment.durationMs, elapsedInWait + (Date.now() - waitStartedAt))
    }
    return Math.min(segment.durationMs, elapsedInWait)
  }

  return audioCurrentTimeSec * 1000
}

export function computeTimelineProgress(
  segments: TimelineSegment[],
  totalDurationMs: number,
  segmentIndex: number,
  playbackState: 'idle' | 'waiting' | 'playing' | 'paused' | 'finished',
  waitRemainingMs: number,
  waitStartedAt: number,
  audioCurrentTimeSec: number,
): number {
  if (totalDurationMs <= 0) {
    return 0
  }

  if (playbackState === 'finished') {
    return 1
  }

  if (playbackState === 'idle') {
    return 0
  }

  let elapsedMs = 0

  for (let i = 0; i < segmentIndex && i < segments.length; i++) {
    elapsedMs += segments[i].durationMs
  }

  const currentSegment = segments[segmentIndex]
  if (currentSegment) {
    elapsedMs += getElapsedMsInSegment(
      currentSegment,
      playbackState === 'playing' || playbackState === 'waiting' ? playbackState : 'paused',
      waitRemainingMs,
      waitStartedAt,
      audioCurrentTimeSec,
    )
  }

  return Math.min(1, Math.max(0, elapsedMs / totalDurationMs))
}
