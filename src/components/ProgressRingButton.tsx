import type { ReactNode } from 'react'
import { controlButtonClass } from './icons'

interface ProgressRingButtonProps {
  progress: number
  showProgress: boolean
  onClick: () => void
  ariaLabel: string
  children: ReactNode
}

const SIZE = 56
const STROKE = 2
const RADIUS = SIZE / 2 - STROKE
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const CENTER = SIZE / 2

export function ProgressRingButton({
  progress,
  showProgress,
  onClick,
  ariaLabel,
  children,
}: ProgressRingButtonProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress))
  const dashOffset = CIRCUMFERENCE * (1 - clampedProgress)

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`relative box-border p-0 ${controlButtonClass}`}
    >
      {showProgress && (
        <svg
          className="pointer-events-none absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2"
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          aria-hidden="true"
        >
          <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.18}
              strokeWidth={STROKE}
            />
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </g>
        </svg>
      )}
      <span className="relative z-10 flex h-full w-full items-center justify-center">
        {children}
      </span>
    </button>
  )
}
