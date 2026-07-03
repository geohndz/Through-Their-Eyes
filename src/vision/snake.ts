import type { VisionMode } from '../types/vision'

export const snake: VisionMode = {
  id: 'snake',
  label: 'Snake',
  emoji: '🐍',
  fragmentShader: `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_uv;

    vec3 heatmapGradient(float t) {
      vec3 black = vec3(0.02, 0.0, 0.06);
      vec3 purple = vec3(0.35, 0.0, 0.55);
      vec3 blue = vec3(0.08, 0.18, 0.95);
      vec3 cyan = vec3(0.0, 0.78, 0.95);
      vec3 green = vec3(0.12, 0.88, 0.18);
      vec3 yellow = vec3(0.98, 0.92, 0.08);
      vec3 orange = vec3(1.0, 0.48, 0.02);
      vec3 red = vec3(1.0, 0.12, 0.05);
      vec3 white = vec3(1.0, 0.98, 0.92);

      if (t < 0.125) {
        return mix(black, purple, t / 0.125);
      }
      if (t < 0.25) {
        return mix(purple, blue, (t - 0.125) / 0.125);
      }
      if (t < 0.375) {
        return mix(blue, cyan, (t - 0.25) / 0.125);
      }
      if (t < 0.5) {
        return mix(cyan, green, (t - 0.375) / 0.125);
      }
      if (t < 0.625) {
        return mix(green, yellow, (t - 0.5) / 0.125);
      }
      if (t < 0.75) {
        return mix(yellow, orange, (t - 0.625) / 0.125);
      }
      if (t < 0.875) {
        return mix(orange, red, (t - 0.75) / 0.125);
      }
      return mix(red, white, (t - 0.875) / 0.125);
    }

    void main() {
      vec4 color = texture2D(u_texture, v_uv);
      float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));

      float t = smoothstep(0.02, 0.98, luma);
      t = pow(t, 0.85);

      vec3 rgb = heatmapGradient(t);

      gl_FragColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
    }
  `,
}
