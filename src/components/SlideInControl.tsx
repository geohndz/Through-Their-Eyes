import type { ReactNode } from 'react'

interface SlideInControlProps {
  children: ReactNode
  delayMs?: number
  className?: string
}

export function SlideInControl({ children, delayMs = 0, className = '' }: SlideInControlProps) {
  return (
    <div
      className={`animate-slide-in-right ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  )
}
