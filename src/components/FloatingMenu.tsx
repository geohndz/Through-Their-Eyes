import { useEffect, useRef } from 'react'
import type { VisionId } from '../types/vision'
import { visionModes } from '../vision'
import { CloseIcon, ScanEyeIcon } from './icons'
import { VisionButton } from './VisionButton'

interface FloatingMenuProps {
  open: boolean
  activeVisionId: VisionId
  onToggle: () => void
  onSelect: (id: VisionId) => void
  onClose: () => void
  onInteraction?: () => void
}

export function FloatingMenu({
  open,
  activeVisionId,
  onToggle,
  onSelect,
  onClose,
  onInteraction,
}: FloatingMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open, onClose])

  return (
    <div
      ref={menuRef}
      data-ui-persistent
      className="fixed bottom-6 right-6 z-10 flex flex-col items-end gap-3"
    >
      {open && (
        <div
          className="flex min-w-[180px] flex-col gap-1 rounded-3xl border border-white/10 bg-neutral-900/90 p-2 shadow-2xl backdrop-blur-md"
          role="menu"
          aria-label="Vision modes"
        >
          {visionModes.map((mode) => (
            <VisionButton
              key={mode.id}
              mode={mode}
              active={mode.id === activeVisionId}
              onSelect={() => {
                onInteraction?.()
                onSelect(mode.id)
              }}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          onInteraction?.()
          onToggle()
        }}
        aria-expanded={open}
        aria-label={open ? 'Close vision menu' : 'Open vision menu'}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-neutral-900/90 text-white shadow-2xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <CloseIcon /> : <ScanEyeIcon />}
      </button>
    </div>
  )
}
