import { useCallback, useEffect, useRef, useState } from 'react'
import { requestCameraStream, shouldMirrorVideo } from '../lib/cameraStream'

export type CameraStatus =
  | 'idle'
  | 'requesting'
  | 'active'
  | 'denied'
  | 'error'
  | 'disabled'

interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>
  stream: MediaStream | null
  status: CameraStatus
  error: string | null
  isVideoReady: boolean
  isCameraEnabled: boolean
  mirrorVideo: boolean
  disableCamera: () => void
  enableCamera: () => void
  suspendForBackground: () => void
  resumeFromBackground: () => void
  stopAll: () => void
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [status, setStatus] = useState<CameraStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [mirrorVideo, setMirrorVideo] = useState(true)
  const [shouldStart, setShouldStart] = useState(true)
  const [startSignal, setStartSignal] = useState(0)
  const wasRunningBeforeBackgroundRef = useRef(false)

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStream(null)
    setIsVideoReady(false)
  }, [])

  const disableCamera = useCallback(() => {
    stopTracks()
    setStatus('disabled')
    setError(null)
    setShouldStart(false)
  }, [stopTracks])

  const enableCamera = useCallback(() => {
    setError(null)
    setShouldStart(true)
    setStartSignal((count) => count + 1)
  }, [])

  const suspendForBackground = useCallback(() => {
    if (!shouldStart || status === 'disabled') {
      return
    }

    if (streamRef.current || status === 'active' || status === 'requesting') {
      wasRunningBeforeBackgroundRef.current = true
      videoRef.current?.pause()
      stopTracks()
      setStatus('idle')
    }
  }, [shouldStart, status, stopTracks])

  const resumeFromBackground = useCallback(() => {
    if (!shouldStart || status === 'disabled' || !wasRunningBeforeBackgroundRef.current) {
      return
    }

    wasRunningBeforeBackgroundRef.current = false
    setStartSignal((count) => count + 1)
  }, [shouldStart, status])

  const stopAll = useCallback(() => {
    wasRunningBeforeBackgroundRef.current = false
    stopTracks()
  }, [stopTracks])

  useEffect(() => {
    if (!shouldStart) {
      return
    }

    let cancelled = false

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error')
        setError('Camera access is not supported in this browser.')
        return
      }

      setStatus('requesting')
      setError(null)
      setIsVideoReady(false)

      try {
        const { stream: mediaStream, facingMode } = await requestCameraStream()

        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = mediaStream
        setMirrorVideo(shouldMirrorVideo(facingMode))
        setStream(mediaStream)
        setStatus('active')
      } catch (err) {
        if (cancelled) {
          return
        }

        const message =
          err instanceof DOMException && err.name === 'NotAllowedError'
            ? 'Camera permission was denied. Please allow access to continue.'
            : err instanceof Error
              ? err.message
              : 'Unable to access the camera.'

        setStatus(
          err instanceof DOMException && err.name === 'NotAllowedError' ? 'denied' : 'error',
        )
        setError(message)
      }
    }

    void startCamera()

    return () => {
      cancelled = true
      stopTracks()
    }
  }, [shouldStart, startSignal, stopTracks])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !stream) {
      return
    }

    const track = stream.getVideoTracks()[0]
    if (!track || track.readyState === 'ended') {
      return
    }

    setIsVideoReady(false)
    video.srcObject = stream

    const markReady = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setIsVideoReady(true)
      }
    }

    video.addEventListener('loadeddata', markReady)
    video.addEventListener('canplay', markReady)

    void video.play().catch((err: unknown) => {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }

      setStatus('error')
      setError('Unable to start the camera preview.')
    })

    return () => {
      video.removeEventListener('loadeddata', markReady)
      video.removeEventListener('canplay', markReady)
      video.srcObject = null
      setIsVideoReady(false)
    }
  }, [stream])

  const isCameraEnabled = shouldStart && status !== 'disabled'

  return {
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
  }
}
