export function shouldMirrorVideo(facingMode: string | undefined): boolean {
  return facingMode !== 'environment'
}

export async function requestCameraStream(): Promise<{
  stream: MediaStream
  facingMode: string | undefined
}> {
  const attempts: MediaStreamConstraints[] = [
    {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    },
    {
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    },
    {
      video: {
        facingMode: { ideal: 'user' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    },
    {
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    },
  ]

  let lastError: unknown

  for (const constraints of attempts) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      const facingMode = stream.getVideoTracks()[0]?.getSettings().facingMode
      return { stream, facingMode }
    } catch (err) {
      lastError = err
    }
  }

  throw lastError
}
