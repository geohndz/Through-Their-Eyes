import type { NarrationLocale, NarrationSet } from '../types/narration'
import type { VisionId } from '../types/vision'
import { engDog } from './eng/dog'

const narrationByLocale: Record<NarrationLocale, Partial<Record<VisionId, NarrationSet>>> = {
  eng: {
    dog: engDog,
  },
}

export function getNarration(
  visionId: VisionId,
  locale: NarrationLocale = 'eng',
): NarrationSet | null {
  return narrationByLocale[locale][visionId] ?? null
}
