import type { UseNarrationResult } from '../hooks/useNarration'
import { VideoIcon, VideoOffIcon, controlButtonClass } from './icons'
import { NarrationControls } from './NarrationControls'
import { SlideInControl } from './SlideInControl'

interface TopRightControlsProps {
  cameraEnabled: boolean
  onDisableCamera: () => void
  onEnableCamera: () => void
  narration: UseNarrationResult
  showNarration: boolean
}

export function TopRightControls({
  cameraEnabled,
  onDisableCamera,
  onEnableCamera,
  narration,
  showNarration,
}: TopRightControlsProps) {
  const showNarrationControls = showNarration && narration.hasNarration

  return (
    <div className="fixed top-6 right-6 z-10 flex flex-col items-center gap-3">
      <SlideInControl>
        <button
          type="button"
          onClick={cameraEnabled ? onDisableCamera : onEnableCamera}
          aria-label={cameraEnabled ? 'Disable camera' : 'Enable camera'}
          className={controlButtonClass}
        >
          {cameraEnabled ? <VideoOffIcon /> : <VideoIcon />}
        </button>
      </SlideInControl>

      {showNarrationControls && (
        <NarrationControls narration={narration} />
      )}
    </div>
  )
}
