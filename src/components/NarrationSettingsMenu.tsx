import { useCallback, useEffect, useRef, useState } from 'react'
import type { UseNarrationResult } from '../hooks/useNarration'
import {
  CaptionsIcon,
  CaptionsOffIcon,
  CloseIcon,
  GaugeIcon,
  SettingsIcon,
  SpeechIcon,
  controlButtonClass,
} from './icons'
import { SettingsMenuRow } from './SettingsMenuRow'
import { SlideInControl } from './SlideInControl'

interface NarrationSettingsMenuProps {
  narration: UseNarrationResult
  chromeVisible: boolean
  onInteraction?: () => void
}

export function NarrationSettingsMenu({
  narration,
  chromeVisible,
  onInteraction,
}: NarrationSettingsMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const {
    playbackRate,
    captionsEnabled,
    localeLabel,
    cyclePlaybackRate,
    toggleCaptions,
  } = narration

  const speedLabel = playbackRate === 1 ? '1x' : playbackRate === 1.5 ? '1.5x' : '2x'

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleToggle = useCallback(() => {
    onInteraction?.()
    setOpen((isOpen) => !isOpen)
  }, [onInteraction])

  const handleSpeedSelect = useCallback(() => {
    onInteraction?.()
    cyclePlaybackRate()
  }, [cyclePlaybackRate, onInteraction])

  const handleCaptionsToggle = useCallback(() => {
    onInteraction?.()
    toggleCaptions()
  }, [onInteraction, toggleCaptions])

  useEffect(() => {
    if (!chromeVisible) {
      setOpen(false)
    }
  }, [chromeVisible])

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        handleClose()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open, handleClose])

  return (
    <SlideInControl delayMs={120} from="left" className="pointer-events-auto fixed top-6 left-6">
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={open}
          aria-label={open ? 'Close narration settings' : 'Open narration settings'}
          className={controlButtonClass}
        >
          <span
            className={`inline-flex transition-transform duration-200 ${open ? 'rotate-90' : 'rotate-0'}`}
          >
            {open ? <CloseIcon /> : <SettingsIcon />}
          </span>
        </button>

        <div
          data-open={open}
          className="menu-drop-down menu-drop-down-left absolute top-full left-0 z-20 mt-3 flex min-w-[280px] flex-col gap-1 rounded-3xl border border-white/10 bg-neutral-900/90 p-2 shadow-2xl backdrop-blur-md"
          role="menu"
          aria-label="Narration settings"
          aria-hidden={!open}
        >
          <SettingsMenuRow
            icon={<GaugeIcon />}
            label="Speed"
            value={speedLabel}
            onClick={handleSpeedSelect}
          />
          <SettingsMenuRow
            icon={captionsEnabled ? <CaptionsIcon /> : <CaptionsOffIcon />}
            label="Captions"
            value={captionsEnabled ? 'ON' : 'OFF'}
            onClick={handleCaptionsToggle}
          />
          <SettingsMenuRow
            icon={<SpeechIcon />}
            label="Language"
            value={localeLabel}
            disabled
          />
        </div>
      </div>
    </SlideInControl>
  )
}
