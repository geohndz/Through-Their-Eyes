import type { UseNarrationResult } from '../hooks/useNarration'
import { PauseIcon, PlayIcon, RotateCcwIcon } from './icons'
import { ProgressRingButton } from './ProgressRingButton'
import { SlideInControl } from './SlideInControl'

interface NarrationControlsProps {
  narration: UseNarrationResult
}

export function NarrationControls({ narration }: NarrationControlsProps) {
  const { isFinished, isPlaying, sessionActive, progress, play, pause, replay } = narration

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
  )
}
