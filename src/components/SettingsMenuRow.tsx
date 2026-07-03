import type { ReactNode } from 'react'

interface SettingsMenuRowProps {
  icon: ReactNode
  label: string
  value: string
  onClick?: () => void
  disabled?: boolean
}

export function SettingsMenuRow({
  icon,
  label,
  value,
  onClick,
  disabled = false,
}: SettingsMenuRowProps) {
  const className = `flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${
    disabled
      ? 'cursor-default text-neutral-400'
      : 'text-neutral-200 hover:bg-white/10'
  }`

  if (disabled) {
    return (
      <div className={className} aria-disabled="true">
        <span className="flex shrink-0 items-center justify-center" aria-hidden="true">
          {icon}
        </span>
        <span className="flex-1 text-base font-medium">{label}</span>
        <span className="text-sm font-medium text-neutral-300">{value}</span>
      </div>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <span className="flex shrink-0 items-center justify-center" aria-hidden="true">
        {icon}
      </span>
      <span className="flex-1 text-base font-medium">{label}</span>
      <span className="text-sm font-medium text-neutral-300">{value}</span>
    </button>
  )
}
