import type { VisionMode } from '../types/vision'

export const dog: VisionMode = {
  id: 'dog',
  label: 'Dog',
  emoji: '🐶',
  fragmentShader: `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_uv;

    vec3 sampleGradient(float t) {
      vec3 deepBlue = vec3(0.04, 0.08, 0.62);
      vec3 blue = vec3(0.10, 0.28, 0.88);
      vec3 cyan = vec3(0.18, 0.62, 0.92);
      vec3 teal = vec3(0.28, 0.72, 0.58);
      vec3 chartreuse = vec3(0.72, 0.82, 0.22);
      vec3 yellow = vec3(0.98, 0.88, 0.12);
      vec3 gold = vec3(1.0, 0.78, 0.05);

      if (t < 0.166) {
        return mix(deepBlue, blue, t / 0.166);
      }
      if (t < 0.333) {
        return mix(blue, cyan, (t - 0.166) / 0.167);
      }
      if (t < 0.5) {
        return mix(cyan, teal, (t - 0.333) / 0.167);
      }
      if (t < 0.666) {
        return mix(teal, chartreuse, (t - 0.5) / 0.166);
      }
      if (t < 0.833) {
        return mix(chartreuse, yellow, (t - 0.666) / 0.167);
      }
      return mix(yellow, gold, (t - 0.833) / 0.167);
    }

    void main() {
      vec4 color = texture2D(u_texture, v_uv);
      vec3 rgb = color.rgb;

      float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
      float yellowSignal = dot(rgb, vec3(0.625, 0.375, 0.0));
      float blueSignal = rgb.b;

      float t = mix(luma, yellowSignal * 0.5 + blueSignal * 0.5, 0.25);
      t = pow(clamp(t, 0.0, 1.0), 0.9);

      vec3 mapped = sampleGradient(t);
      mapped = mix(mapped, rgb, 0.06);

      gl_FragColor = vec4(clamp(mapped, 0.0, 1.0), color.a);
    }
  `,
}
