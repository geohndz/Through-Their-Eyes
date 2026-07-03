import type { UseNarrationResult } from '../hooks/useNarration'
import {
  CaptionsIcon,
  CaptionsOffIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  controlButtonClass,
} from './icons'
import { ProgressRingButton } from './ProgressRingButton'
import { SlideInControl } from './SlideInControl'

interface NarrationControlsProps {
  narration: UseNarrationResult
}

export function NarrationControls({ narration }: NarrationControlsProps) {
  const {
    isFinished,
    isPlaying,
    sessionActive,
    progress,
    playbackRate,
    captionsEnabled,
    play,
    pause,
    replay,
    toggleCaptions,
    cyclePlaybackRate,
  } = narration

  const speedLabel = playbackRate === 1 ? '1x' : playbackRate === 1.5 ? '1.5x' : '2x'

  const handlePlaybackClick = () => {
    if (isFinished) {
      replay()
      return
    }

    if (isPlaying) {
      pause()
      return
    }

    play()
  }

  const playbackLabel = isFinished
    ? 'Replay narration'
    : isPlaying
      ? 'Pause narration'
      : 'Play narration'

  const PlaybackIcon = isFinished ? RotateCcwIcon : isPlaying ? PauseIcon : PlayIcon
  const showProgress = sessionActive || isFinished

  return (
    <>
      <SlideInControl delayMs={60}>
        <ProgressRingButton
          progress={isFinished ? 1 : progress}
          showProgress={showProgress}
          onClick={handlePlaybackClick}
          ariaLabel={playbackLabel}
        >
          <PlaybackIcon />
        </ProgressRingButton>
      </SlideInControl>

      <SlideInControl delayMs={120}>
        <button
          type="button"
          onClick={cyclePlaybackRate}
          aria-label={`Playback speed ${speedLabel}. Tap to change.`}
          className={controlButtonClass}
        >
          <span className="text-sm font-semibold tracking-tight">{speedLabel}</span>
        </button>
      </SlideInControl>

      {sessionActive && !isFinished && (
        <SlideInControl delayMs={60}>
          <button
            type="button"
            onClick={toggleCaptions}
            aria-label={captionsEnabled ? 'Hide captions' : 'Show captions'}
            className={controlButtonClass}
          >
            {captionsEnabled ? <CaptionsIcon /> : <CaptionsOffIcon />}
          </button>
        </SlideInControl>
      )}
    </>
  )
}
