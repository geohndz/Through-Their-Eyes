export interface ViewportMetrics {
  width: number
  height: number
}

export function getViewportMetrics(): ViewportMetrics {
  const innerWidth = window.innerWidth
  const innerHeight = window.innerHeight
  const visualViewport = window.visualViewport
  const visualWidth = visualViewport?.width ?? innerWidth
  const visualHeight = visualViewport?.height ?? innerHeight

  let width = Math.max(innerWidth, visualWidth)
  let height = Math.max(innerHeight, visualHeight)

  const landscapeQuery = window.matchMedia('(orientation: landscape)').matches
  const portraitQuery = window.matchMedia('(orientation: portrait)').matches

  // Mobile Safari can keep portrait-width layout metrics in landscape.
  if (landscapeQuery && width < height) {
    ;[width, height] = [height, width]
  } else if (portraitQuery && width > height) {
    ;[width, height] = [height, width]
  }

  return { width, height }
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
