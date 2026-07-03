import { useCallback, useEffect, useRef, useState } from 'react'
import { getActiveCueText, buildProportionalCues, splitIntoSentences } from '../lib/captions'
import type { CaptionCue } from '../lib/captions'
import {
  buildNarrationTimeline,
  computeTimelineProgress,
  type TimelineSegment,
} from '../lib/narrationTimeline'
import { getNarration } from '../narration'
import type { NarrationSet } from '../types/narration'
import type { NarrationLocale } from '../types/narration'
import type { VisionId } from '../types/vision'

type PlaybackState = 'idle' | 'waiting' | 'playing' | 'paused' | 'finished'

const PLAYBACK_RATES = [1, 1.5, 2] as const
export type NarrationPlaybackRate = (typeof PLAYBACK_RATES)[number]

const LOCALE_LABELS: Record<NarrationLocale, string> = {
  eng: 'English',
}

export interface UseNarrationResult {
  sessionActive: boolean
  isPlaying: boolean
  isFinished: boolean
  progress: number
  playbackRate: NarrationPlaybackRate
  currentCaption: string | null
  captionsEnabled: boolean
  hasNarration: boolean
  locale: NarrationLocale
  localeLabel: string
  toggleCaptions: () => void
  cyclePlaybackRate: () => void
  play: () => void
  pause: () => void
  replay: () => void
  reset: () => void
}

export function useNarration(visionId: VisionId): UseNarrationResult {
  const narrationSet = getNarration(visionId)
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle')
  const [currentCaption, setCurrentCaption] = useState<string | null>(null)
  const [captionsEnabled, setCaptionsEnabled] = useState(true)
  const [progress, setProgress] = useState(0)
  const [playbackRate, setPlaybackRate] = useState<NarrationPlaybackRate>(1)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const narrationRef = useRef<NarrationSet | null>(narrationSet)
  const trackIndexRef = useRef(0)
  const pendingTrackIndexRef = useRef(0)
  const segmentIndexRef = useRef(0)
  const timelineRef = useRef<TimelineSegment[]>([])
  const totalDurationMsRef = useRef(0)
  const currentCuesRef = useRef<CaptionCue[]>([])
  const waitTimeoutRef = useRef<number | null>(null)
  const waitStartedAtRef = useRef(0)
  const waitRemainingRef = useRef(0)
  const isWaitingRef = useRef(false)
  const playbackStateRef = useRef<PlaybackState>('idle')
  const playbackRateRef = useRef<NarrationPlaybackRate>(1)

  useEffect(() => {
    playbackRateRef.current = playbackRate
    const audio = audioRef.current
    if (audio?.src) {
      audio.playbackRate = playbackRate
    }
  }, [playbackRate])

  useEffect(() => {
    playbackStateRef.current = playbackState
  }, [playbackState])

  const updateProgress = useCallback(() => {
    const audio = audioRef.current
    setProgress(
      computeTimelineProgress(
        timelineRef.current,
        totalDurationMsRef.current,
        segmentIndexRef.current,
        playbackStateRef.current,
        waitRemainingRef.current,
        waitStartedAtRef.current,
        audio?.currentTime ?? 0,
      ),
    )
  }, [])

  const syncCaptionToCurrentTime = useCallback(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }
    setCurrentCaption(getActiveCueText(currentCuesRef.current, audio.currentTime))
    updateProgress()
  }, [updateProgress])

  const clearWaitTimeout = useCallback(() => {
    if (waitTimeoutRef.current !== null) {
      window.clearTimeout(waitTimeoutRef.current)
      waitTimeoutRef.current = null
    }
    isWaitingRef.current = false
  }, [])

  const detachCaptionSync = useCallback(
    (audio: HTMLAudioElement) => {
      audio.removeEventListener('timeupdate', syncCaptionToCurrentTime)
      currentCuesRef.current = []
    },
    [syncCaptionToCurrentTime],
  )

  const stopAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }
    detachCaptionSync(audio)
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
  }, [detachCaptionSync])

  const attachCaptionSync = useCallback(
    (audio: HTMLAudioElement, cues: CaptionCue[]) => {
      currentCuesRef.current = cues
      audio.removeEventListener('timeupdate', syncCaptionToCurrentTime)
      audio.addEventListener('timeupdate', syncCaptionToCurrentTime)
      syncCaptionToCurrentTime()
    },
    [syncCaptionToCurrentTime],
  )

  const reset = useCallback(() => {
    clearWaitTimeout()
    stopAudio()
    trackIndexRef.current = 0
    pendingTrackIndexRef.current = 0
    segmentIndexRef.current = 0
    waitRemainingRef.current = 0
    setPlaybackState('idle')
    setCurrentCaption(null)
    setProgress(0)
    setPlaybackRate(1)
    playbackRateRef.current = 1
  }, [clearWaitTimeout, stopAudio])

  const playTrack = useCallback(
    (index: number) => {
      const narration = narrationRef.current
      if (!narration || index >= narration.tracks.length) {
        return
      }

      const track = narration.tracks[index]
      let audio = audioRef.current
      if (!audio) {
        audio = new Audio()
        audioRef.current = audio
      }

      trackIndexRef.current = index
      segmentIndexRef.current = index * 2 + 1
      setPlaybackState('playing')
      setCurrentCaption(null)
      updateProgress()

      audio.src = track.src
      audio.currentTime = 0
      audio.playbackRate = playbackRateRef.current

      const handleLoadedMetadata = () => {
        audio?.removeEventListener('loadedmetadata', handleLoadedMetadata)
        if (!audio || !Number.isFinite(audio.duration)) {
          return
        }

        const cues = buildProportionalCues(splitIntoSentences(track.script), audio.duration)
        attachCaptionSync(audio, cues)
      }

      const handleEnded = () => {
        audio?.removeEventListener('ended', handleEnded)
        if (audio) {
          detachCaptionSync(audio)
        }

        const nextIndex = index + 1
        if (!narration || nextIndex >= narration.tracks.length) {
          setPlaybackState('finished')
          setCurrentCaption(null)
          setProgress(1)
          return
        }

        const nextTrack = narration.tracks[nextIndex]
        pendingTrackIndexRef.current = nextIndex
        segmentIndexRef.current = nextIndex * 2
        setPlaybackState('waiting')
        setCurrentCaption(null)
        isWaitingRef.current = true
        waitRemainingRef.current = nextTrack.delayBeforeMs
        waitStartedAtRef.current = Date.now()
        updateProgress()

        waitTimeoutRef.current = window.setTimeout(() => {
          waitTimeoutRef.current = null
          isWaitingRef.current = false
          playTrack(nextIndex)
        }, nextTrack.delayBeforeMs)
      }

      audio.addEventListener('loadedmetadata', handleLoadedMetadata)
      audio.addEventListener('ended', handleEnded)
      void audio.play().catch(() => {
        audio?.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audio?.removeEventListener('ended', handleEnded)
        if (audio) {
          detachCaptionSync(audio)
        }
        setPlaybackState('idle')
        setCurrentCaption(null)
        setProgress(0)
      })
    },
    [attachCaptionSync, detachCaptionSync, updateProgress],
  )

  const startSequence = useCallback(() => {
    const narration = narrationRef.current
    if (!narration || narration.tracks.length === 0) {
      return
    }

    clearWaitTimeout()
    stopAudio()
    trackIndexRef.current = 0
    pendingTrackIndexRef.current = 0
    segmentIndexRef.current = 0

    const firstTrack = narration.tracks[0]
    setPlaybackState('waiting')
    setCurrentCaption(null)
    isWaitingRef.current = true
    waitRemainingRef.current = firstTrack.delayBeforeMs
    waitStartedAtRef.current = Date.now()
    updateProgress()

    waitTimeoutRef.current = window.setTimeout(() => {
      waitTimeoutRef.current = null
      isWaitingRef.current = false
      playTrack(0)
    }, firstTrack.delayBeforeMs)
  }, [clearWaitTimeout, playTrack, stopAudio, updateProgress])

  const play = useCallback(() => {
    if (!narrationRef.current) {
      return
    }

    if (playbackState === 'finished') {
      startSequence()
      return
    }

    if (playbackState === 'paused') {
      const audio = audioRef.current
      if (audio?.src && !audio.ended && audio.currentTime > 0 && audio.paused) {
        setPlaybackState('playing')
        syncCaptionToCurrentTime()
        void audio.play()
        return
      }

      if (waitRemainingRef.current > 0) {
        setPlaybackState('waiting')
        isWaitingRef.current = true
        waitStartedAtRef.current = Date.now()
        updateProgress()
        waitTimeoutRef.current = window.setTimeout(() => {
          waitTimeoutRef.current = null
          isWaitingRef.current = false
          playTrack(pendingTrackIndexRef.current)
        }, waitRemainingRef.current)
      }
      return
    }

    if (playbackState === 'idle') {
      startSequence()
    }
  }, [playbackState, playTrack, startSequence, syncCaptionToCurrentTime, updateProgress])

  const pause = useCallback(() => {
    if (playbackState === 'waiting') {
      const elapsed = Date.now() - waitStartedAtRef.current
      waitRemainingRef.current = Math.max(0, waitRemainingRef.current - elapsed)
      clearWaitTimeout()
      isWaitingRef.current = false
      setPlaybackState('paused')
      updateProgress()
      return
    }

    if (playbackState === 'playing') {
      audioRef.current?.pause()
      setPlaybackState('paused')
      updateProgress()
    }
  }, [clearWaitTimeout, playbackState, updateProgress])

  const replay = useCallback(() => {
    startSequence()
  }, [startSequence])

  const toggleCaptions = useCallback(() => {
    setCaptionsEnabled((enabled) => !enabled)
  }, [])

  const cyclePlaybackRate = useCallback(() => {
    setPlaybackRate((current) => {
      const index = PLAYBACK_RATES.indexOf(current)
      return PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length]
    })
  }, [])

  useEffect(() => {
    narrationRef.current = narrationSet
    reset()

    if (!narrationSet) {
      timelineRef.current = []
      totalDurationMsRef.current = 0
      return
    }

    let cancelled = false
    void buildNarrationTimeline(narrationSet).then(({ segments, totalDurationMs }) => {
      if (cancelled) {
        return
      }
      timelineRef.current = segments
      totalDurationMsRef.current = totalDurationMs
    })

    return () => {
      cancelled = true
    }
  }, [narrationSet, visionId, reset])

  useEffect(() => {
    if (playbackState !== 'waiting' && playbackState !== 'playing') {
      return
    }

    let frameId = 0
    const tick = () => {
      updateProgress()
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [playbackState, updateProgress])

  useEffect(() => {
    return () => {
      clearWaitTimeout()
      stopAudio()
    }
  }, [clearWaitTimeout, stopAudio])

  const sessionActive = playbackState !== 'idle'
  const isPlaying = playbackState === 'waiting' || playbackState === 'playing'
  const locale: NarrationLocale = narrationSet?.locale ?? 'eng'
  const localeLabel = LOCALE_LABELS[locale]

  return {
    sessionActive,
    isPlaying,
    isFinished: playbackState === 'finished',
    progress,
    playbackRate,
    currentCaption,
    captionsEnabled,
    hasNarration: narrationSet !== null,
    locale,
    localeLabel,
    toggleCaptions,
    cyclePlaybackRate,
    play,
    pause,
    replay,
    reset,
  }
}
