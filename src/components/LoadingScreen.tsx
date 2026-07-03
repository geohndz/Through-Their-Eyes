import { useEffect, useState } from 'react'
import { logoUrl } from '../lib/logo'

const LOADING_MESSAGES = [
  'Calibrating human color vision…',
  'Mapping the dog color spectrum…',
  'Booting up compound eyes…',
  'Warming up thermal snake vision…',
  'Teaching reds to look yellow…',
  'Counting rods and cones…',
  'Bzzzz… loading hexagonal pixels…',
  'Sniffing out ultraviolet traces…',
  'Almost ready to see the world differently…',
]

const LOADING_DURATION_MS = 5000
const MESSAGE_INTERVAL_MS = 1500
const EXIT_DURATION_MS = 450

interface LoadingScreenProps {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)
  const [messageVisible, setMessageVisible] = useState(true)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const start = performance.now()
    let frameId = 0

    const tick = (now: number) => {
      const elapsed = now - start
      const t = Math.min(elapsed / LOADING_DURATION_MS, 1)
      const eased = 1 - (1 - t) ** 3
      setProgress(Math.round(eased * 100))

      if (t < 1) {
        frameId = requestAnimationFrame(tick)
        return
      }

      setExiting(true)
      window.setTimeout(onComplete, EXIT_DURATION_MS)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [onComplete])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageVisible(false)
      window.setTimeout(() => {
        setMessageIndex((index) => (index + 1) % LOADING_MESSAGES.length)
        setMessageVisible(true)
      }, 180)
    }, MESSAGE_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black px-6 transition-opacity duration-500 ${
        exiting ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-busy={!exiting}
      aria-live="polite"
      aria-label="Loading"
    >
      <img
        src={logoUrl}
        alt="Through Their Eyes"
        className="mb-10 w-44 max-w-[55vw] sm:w-52"
      />

      <p
        className={`mb-8 min-h-5 max-w-xs text-center text-sm text-neutral-400 transition-opacity duration-200 ${
          messageVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {LOADING_MESSAGES[messageIndex]}
      </p>

      <div
        className="h-1 w-44 max-w-[55vw] overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Loading progress"
      >
        <div
          className="h-full rounded-full bg-white transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
