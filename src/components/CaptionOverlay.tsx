interface CaptionOverlayProps {
  caption: string | null
  visible: boolean
}

export function CaptionOverlay({ caption, visible }: CaptionOverlayProps) {
  if (!visible || !caption) {
    return null
  }

  return (
    <div
      data-ui-persistent
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-8 left-1/2 z-10 w-[min(calc(100vw-2rem),28rem)] -translate-x-1/2 rounded-2xl bg-black/70 px-5 py-3 text-center text-sm leading-relaxed text-white backdrop-blur-sm"
    >
      {caption}
    </div>
  )
}
