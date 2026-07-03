import type { VisionMode } from '../types/vision'

export const bee: VisionMode = {
  id: 'bee',
  label: 'Bee',
  emoji: '🐝',
  fragmentShader: `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_uv;

    void main() {
      vec4 color = texture2D(u_texture, v_uv);
      vec3 rgb = color.rgb;

      float luma = dot(rgb, vec3(0.299, 0.587, 0.114));

      vec3 uv = vec3(
        luma * 0.35 + rgb.b * 0.4,
        luma * 0.25 + rgb.g * 0.3,
        luma * 0.5 + rgb.b * 0.8 + 0.15
      );

      rgb = pow(uv, vec3(0.8));
      rgb = mix(rgb, vec3(1.0), smoothstep(0.65, 1.0, luma) * 0.35);

      gl_FragColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
    }
  `,
}
