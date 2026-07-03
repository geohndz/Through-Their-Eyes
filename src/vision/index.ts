import type { VisionId, VisionMode } from '../types/vision'
import { bee } from './bee'
import { dog } from './dog'
import { human } from './human'
import { snake } from './snake'

export const visionModes: VisionMode[] = [human, dog, bee, snake]

export function getVisionMode(id: VisionId): VisionMode {
  const mode = visionModes.find((m) => m.id === id)
  if (!mode) {
    return human
  }
  return mode
}
