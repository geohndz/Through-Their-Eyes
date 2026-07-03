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
  onInteraction?: () => void
}

export function TopRightControls({
  cameraEnabled,
  onDisableCamera,
  onEnableCamera,
  narration,
  showNarration,
  onInteraction,
}: TopRightControlsProps) {
  const showNarrationControls = showNarration && narration.hasNarration

  const handleCameraClick = () => {
    onInteraction?.()
    if (cameraEnabled) {
      onDisableCamera()
      return
    }
    onEnableCamera()
  }

  return (
    <div className="pointer-events-auto fixed top-6 right-6 flex flex-col items-center gap-3">
      <SlideInControl>
        <button
          type="button"
          onClick={handleCameraClick}
          aria-label={cameraEnabled ? 'Disable camera' : 'Enable camera'}
          className={controlButtonClass}
        >
          {cameraEnabled ? <VideoOffIcon /> : <VideoIcon />}
        </button>
      </SlideInControl>

      {showNarrationControls && (
        <NarrationControls narration={narration} onInteraction={onInteraction} />
      )}
    </div>
  )
}
