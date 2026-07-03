import { useCallback, useEffect, useRef, useState } from 'react'

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
  disableCamera: () => void
  enableCamera: () => void
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [status, setStatus] = useState<CameraStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [shouldStart, setShouldStart] = useState(true)
  const [startSignal, setStartSignal] = useState(0)

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
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })

        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = mediaStream
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
    disableCamera,
    enableCamera,
  }
}
