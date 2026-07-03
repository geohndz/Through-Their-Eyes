import type { VisionMode } from '../types/vision'

export const human: VisionMode = {
  id: 'human',
  label: 'Human',
  emoji: '👁',
  fragmentShader: `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_uv;

    void main() {
      gl_FragColor = texture2D(u_texture, v_uv);
    }
  `,
}
