import { useEffect, useRef, useState } from 'react'
import type { VisionId } from '../types/vision'
import { WebGLRenderer } from '../lib/webglRenderer'
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
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = width
      canvas.height = height
      renderer.resize(width, height)
    }

    resize()
    window.addEventListener('resize', resize)

    let frameId = 0
    const renderFrame = () => {
      const video = videoRef.current
      if (video && video.videoWidth > 0) {
        renderer.setVideoMetrics(video.videoWidth, video.videoHeight, mirrorVideoRef.current)
        renderer.render(video)
      }
      frameId = requestAnimationFrame(renderFrame)
    }

    frameId = requestAnimationFrame(renderFrame)

    return () => {
      window.removeEventListener('resize', resize)
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

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 h-full w-full"
    />
  )
}
