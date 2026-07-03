import { useEffect, useState } from 'react'

export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(() => !document.hidden)

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return isVisible
}

export function usePageLifecycle({
  onBackground,
  onForeground,
  onPageExit,
}: {
  onBackground: () => void
  onForeground: () => void
  onPageExit: () => void
}) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onBackground()
      } else {
        onForeground()
      }
    }

    const handlePageHide = () => {
      onPageExit()
    }

    const handleFreeze = () => {
      onBackground()
    }

    const handleResume = () => {
      onForeground()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)
    document.addEventListener('freeze', handleFreeze)
    document.addEventListener('resume', handleResume)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
      document.removeEventListener('freeze', handleFreeze)
      document.removeEventListener('resume', handleResume)
    }
  }, [onBackground, onForeground, onPageExit])
}
