export interface ViewportMetrics {
  width: number
  height: number
  offsetLeft: number
  offsetTop: number
}

export function getViewportMetrics(): ViewportMetrics {
  const visualViewport = window.visualViewport

  return {
    width: visualViewport?.width ?? window.innerWidth,
    height: visualViewport?.height ?? window.innerHeight,
    offsetLeft: visualViewport?.offsetLeft ?? 0,
    offsetTop: visualViewport?.offsetTop ?? 0,
  }
}

export function getDisplayVideoSize(video: HTMLVideoElement): { width: number; height: number } {
  const { videoWidth, videoHeight } = video

  if (videoWidth === 0 || videoHeight === 0) {
    return { width: videoWidth, height: videoHeight }
  }

  const screenOrientation = window.screen.orientation?.type
  const viewportLandscape = isLandscapeViewport()
  const videoLandscape = videoWidth > videoHeight

  if (screenOrientation) {
    const screenLandscape = screenOrientation.startsWith('landscape')
    if (screenLandscape !== videoLandscape) {
      return { width: videoHeight, height: videoWidth }
    }
    return { width: videoWidth, height: videoHeight }
  }

  if (viewportLandscape !== videoLandscape) {
    return { width: videoHeight, height: videoWidth }
  }

  return { width: videoWidth, height: videoHeight }
}

function isLandscapeViewport(): boolean {
  const { width, height } = getViewportMetrics()
  return width > height
}
