import { useCallback, useEffect, useRef, useState } from 'react'

const IDLE_DELAY_MS = 5000

function isUiTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false
  }

  return (
    target.closest('[data-ui-chrome]') !== null ||
    target.closest('[data-ui-persistent]') !== null
  )
}

interface UseControlsChromeOptions {
  enabled: boolean
  onHide?: () => void
}

interface UseControlsChromeResult {
  chromeVisible: boolean
  revealKey: number
  showChrome: () => void
  hideChrome: () => void
  resetIdleTimer: () => void
}

export function useControlsChrome({
  enabled,
  onHide,
}: UseControlsChromeOptions): UseControlsChromeResult {
  const [chromeVisible, setChromeVisible] = useState(true)
  const [revealKey, setRevealKey] = useState(0)
  const idleTimeoutRef = useRef<number | null>(null)
  const onHideRef = useRef(onHide)

  useEffect(() => {
    onHideRef.current = onHide
  }, [onHide])

  const clearIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current !== null) {
      window.clearTimeout(idleTimeoutRef.current)
      idleTimeoutRef.current = null
    }
  }, [])

  const hideChrome = useCallback(() => {
    clearIdleTimeout()
    setChromeVisible(false)
    onHideRef.current?.()
  }, [clearIdleTimeout])

  const scheduleIdleHide = useCallback(() => {
    clearIdleTimeout()
    if (!enabled) {
      return
    }

    idleTimeoutRef.current = window.setTimeout(() => {
      idleTimeoutRef.current = null
      setChromeVisible(false)
      onHideRef.current?.()
    }, IDLE_DELAY_MS)
  }, [clearIdleTimeout, enabled])

  const showChrome = useCallback(() => {
    setChromeVisible((wasVisible) => {
      if (!wasVisible) {
        setRevealKey((key) => key + 1)
      }
      return true
    })
    scheduleIdleHide()
  }, [scheduleIdleHide])

  const resetIdleTimer = useCallback(() => {
    if (!enabled || !chromeVisible) {
      return
    }

    scheduleIdleHide()
  }, [chromeVisible, enabled, scheduleIdleHide])

  useEffect(() => {
    if (!enabled) {
      clearIdleTimeout()
      setChromeVisible(true)
      return
    }

    scheduleIdleHide()
    return clearIdleTimeout
  }, [clearIdleTimeout, enabled, scheduleIdleHide])

  useEffect(() => {
    if (!enabled || !chromeVisible) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (isUiTarget(event.target)) {
        scheduleIdleHide()
        return
      }

      hideChrome()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [chromeVisible, enabled, hideChrome, scheduleIdleHide])

  return {
    chromeVisible,
    revealKey,
    showChrome,
    hideChrome,
    resetIdleTimer,
  }
}
