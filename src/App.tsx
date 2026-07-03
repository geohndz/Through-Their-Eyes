import { useCallback, useState } from 'react'
import { logoUrl } from './lib/logo'
import { Camera } from './components/Camera'
import { CaptionOverlay } from './components/CaptionOverlay'
import { FloatingMenu } from './components/FloatingMenu'
import { LoadingScreen } from './components/LoadingScreen'
import { TopRightControls } from './components/TopRightControls'
import { useCamera } from './hooks/useCamera'
import { useNarration } from './hooks/useNarration'
import { usePageLifecycle } from './hooks/usePageVisibility'
import type { VisionId } from './types/vision'

function App() {
  const {
    videoRef,
    stream,
    status,
    error,
    isVideoReady,
    isCameraEnabled,
    mirrorVideo,
    disableCamera,
    enableCamera,
    suspendForBackground,
    resumeFromBackground,
    stopAll,
  } = useCamera()
  const [visionId, setVisionId] = useState<VisionId>('human')
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const narration = useNarration(visionId)
  const {
    reset: resetNarration,
    pauseForBackground: pauseNarrationForBackground,
    resumeFromBackground: resumeNarrationFromBackground,
  } = narration

  const handleBackground = useCallback(() => {
    setMenuOpen(false)
    pauseNarrationForBackground()
    suspendForBackground()
  }, [pauseNarrationForBackground, suspendForBackground])

  const handleForeground = useCallback(() => {
    resumeFromBackground()
    resumeNarrationFromBackground()
  }, [resumeFromBackground, resumeNarrationFromBackground])

  const handlePageExit = useCallback(() => {
    setMenuOpen(false)
    resetNarration()
    stopAll()
  }, [resetNarration, stopAll])

  usePageLifecycle({
    onBackground: handleBackground,
    onForeground: handleForeground,
    onPageExit: handlePageExit,
  })

  const handleSelect = useCallback((id: VisionId) => {
    setVisionId(id)
    setMenuOpen(false)
  }, [])

  const handleClose = useCallback(() => {
    setMenuOpen(false)
  }, [])

  const handleToggleMenu = useCallback(() => {
    setMenuOpen((open) => !open)
  }, [])

  const handleDisableCamera = useCallback(() => {
    setMenuOpen(false)
    resetNarration()
    disableCamera()
  }, [disableCamera, resetNarration])

  const showCamera = status === 'active' && stream !== null && isVideoReady
  const showVisionMenu = status === 'active' && stream !== null
  const cameraIsOn = isCameraEnabled && status === 'active'

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      <div className="fixed inset-0 bg-black">
        <video
          ref={videoRef}
          className="pointer-events-none fixed top-0 left-0 h-px w-px opacity-0"
          autoPlay
          playsInline
          muted
        />

        {showCamera && (
          <Camera
            videoRef={videoRef}
            visionId={visionId}
            mirrorVideo={mirrorVideo}
            isActive
          />
        )}

        {status === 'disabled' && (
          <div className="fixed inset-0 flex flex-col items-center justify-center px-6">
            <img
              src={logoUrl}
              alt="Through Their Eyes"
              className="mb-8 w-44 max-w-[55vw] sm:w-52"
            />
            <p className="text-lg text-neutral-300">Camera disabled</p>
          </div>
        )}

        {isCameraEnabled && status === 'active' && stream !== null && !isVideoReady && (
          <div className="fixed inset-0 flex items-center justify-center px-6">
            <p className="text-lg text-neutral-300">Starting camera…</p>
          </div>
        )}

        {isCameraEnabled && status === 'requesting' && (
          <div className="fixed inset-0 flex items-center justify-center px-6">
            <p className="text-lg text-neutral-300">Requesting camera access…</p>
          </div>
        )}

        {isCameraEnabled && (status === 'denied' || status === 'error') && (
          <div className="fixed inset-0 flex items-center justify-center px-6">
            <div className="max-w-sm text-center text-neutral-300">
              <p className="text-lg font-medium text-white">Camera unavailable</p>
              <p className="mt-2 text-sm text-neutral-400">{error}</p>
            </div>
          </div>
        )}

        <TopRightControls
          cameraEnabled={cameraIsOn}
          onDisableCamera={handleDisableCamera}
          onEnableCamera={enableCamera}
          narration={narration}
          showNarration={showVisionMenu}
        />

        <CaptionOverlay
          caption={narration.currentCaption}
          visible={narration.sessionActive && narration.captionsEnabled}
        />

        {showVisionMenu && (
          <FloatingMenu
            open={menuOpen}
            activeVisionId={visionId}
            onToggle={handleToggleMenu}
            onSelect={handleSelect}
            onClose={handleClose}
          />
        )}
      </div>
    </>
  )
}

export default App
