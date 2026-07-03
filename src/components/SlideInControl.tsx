import type { ReactNode } from 'react'

interface SlideInControlProps {
  children: ReactNode
  delayMs?: number
  className?: string
  from?: 'left' | 'right'
}

export function SlideInControl({
  children,
  delayMs = 0,
  className = '',
  from = 'right',
}: SlideInControlProps) {
  const animationClass = from === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right'

  return (
    <div
      className={`${animationClass} ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  )
}
