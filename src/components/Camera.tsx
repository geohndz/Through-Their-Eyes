import { useEffect, useRef, useState } from 'react'
import type { VisionId } from '../types/vision'
import { WebGLRenderer } from '../lib/webglRenderer'
import { getDisplayVideoSize, getViewportMetrics } from '../lib/viewportMetrics'
import { visionModes } from '../vision'

interface CameraProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  visionId: VisionId
  mirrorVideo: boolean
  isActive: boolean
}

export function Camera({ videoRef, visionId, mirrorVideo, isActive }: CameraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<WebGLRenderer | null>(null)
  const visionIdRef = useRef(visionId)
  const mirrorVideoRef = useRef(mirrorVideo)
  const [renderError, setRenderError] = useState<string | null>(null)

  useEffect(() => {
    visionIdRef.current = visionId
    rendererRef.current?.setVisionMode(visionId)
  }, [visionId])

  useEffect(() => {
    mirrorVideoRef.current = mirrorVideo
  }, [mirrorVideo])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isActive) {
      return
    }

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer(canvas, visionModes)
      renderer.setVisionMode(visionIdRef.current)
      rendererRef.current = renderer
      setRenderError(null)
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : 'WebGL failed to initialize.')
      return
    }

    const resize = () => {
      const { width, height } = getViewportMetrics()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const bufferWidth = Math.round(width * dpr)
      const bufferHeight = Math.round(height * dpr)

      canvas.width = bufferWidth
      canvas.height = bufferHeight
      renderer.resize(bufferWidth, bufferHeight)
    }

    const handleResize = () => {
      resize()
    }

    const handleOrientationChange = () => {
      requestAnimationFrame(() => {
        resize()
        requestAnimationFrame(resize)
      })
    }

    resize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
    window.visualViewport?.addEventListener('resize', handleResize)

    const video = videoRef.current
    video?.addEventListener('resize', handleResize)

    let frameId = 0
    const renderFrame = () => {
      const currentVideo = videoRef.current
      if (currentVideo && currentVideo.videoWidth > 0) {
        const { width, height } = getDisplayVideoSize(currentVideo)
        renderer.setVideoMetrics(width, height, mirrorVideoRef.current)
        renderer.render(currentVideo)
      }
      frameId = requestAnimationFrame(renderFrame)
    }

    frameId = requestAnimationFrame(renderFrame)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.visualViewport?.removeEventListener('resize', handleResize)
      video?.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frameId)
      renderer.dispose()
      rendererRef.current = null
    }
  }, [isActive, videoRef])

  if (renderError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center px-6">
        <p className="max-w-sm text-center text-sm text-neutral-400">{renderError}</p>
      </div>
    )
  }

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full touch-none" />
}
