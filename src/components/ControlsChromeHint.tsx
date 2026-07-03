import { useEffect, useState } from 'react'

const HINT_VISIBLE_MS = 2000

interface ControlsChromeHintProps {
  visible: boolean
}

export function ControlsChromeHint({ visible }: ControlsChromeHintProps) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!visible) {
      setDismissed(false)
      return
    }

    setDismissed(false)
    const timeoutId = window.setTimeout(() => {
      setDismissed(true)
    }, HINT_VISIBLE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [visible])

  if (!visible) {
    return null
  }

  return (
    <div
      aria-hidden={dismissed}
      className={`controls-hint pointer-events-none fixed inset-0 z-[6] flex items-center justify-center px-6 ${
        dismissed ? 'controls-hint-hidden' : 'controls-hint-visible'
      }`}
    >
      <p className="w-fit max-w-[min(calc(100vw-2rem),28rem)] rounded-2xl bg-black/70 px-5 py-3 text-center text-sm leading-relaxed text-white backdrop-blur-sm">
        Tap to bring controls back
      </p>
    </div>
  )
}
