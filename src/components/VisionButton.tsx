import type { VisionMode } from '../types/vision'

interface VisionButtonProps {
  mode: VisionMode
  active: boolean
  onSelect: () => void
}

export function VisionButton({ mode, active, onSelect }: VisionButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${
        active
          ? 'bg-white/15 text-white'
          : 'text-neutral-200 hover:bg-white/10'
      }`}
    >
      <span className="text-xl" aria-hidden="true">
        {mode.emoji}
      </span>
      <span className="text-base font-medium">{mode.label}</span>
    </button>
  )
}
