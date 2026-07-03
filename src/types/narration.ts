import type { VisionId } from './vision'

export type NarrationLocale = 'eng'

export interface NarrationTrack {
  src: string
  delayBeforeMs: number
  script: string
}

export interface NarrationSet {
  visionId: VisionId
  locale: NarrationLocale
  tracks: NarrationTrack[]
}
