export type VisionId = 'human' | 'dog' | 'bee' | 'snake'

export interface VisionMode {
  id: VisionId
  label: string
  emoji: string
  fragmentShader: string
}
