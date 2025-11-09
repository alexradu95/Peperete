import { createShaderMaterial } from './shaderMaterialFactory';

/**
 * Audio Pulse Shader Material
 * Creates pulsing circular patterns that respond to audio amplitude
 * Different frequency bands create concentric rings
 */
const AudioPulseShaderMaterial = createShaderMaterial(
  'AudioPulseShaderMaterial',
  // Uniforms
  {
    time: 0,
    audioAmplitude: 0,
    audioBass: 0,
    audioMid: 0,
    audioTreble: 0,
    audioFrequency: 0
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float time;
    uniform float audioAmplitude;
    uniform float audioBass;
    uniform float audioMid;
    uniform float audioTreble;
    uniform float audioFrequency;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv - 0.5;
      float dist = length(uv) * 2.0;

      // Create pulsing rings for each frequency band
      float bassRing = abs(sin(dist * 5.0 - time * 2.0 + audioBass * 10.0));
      float midRing = abs(sin(dist * 8.0 - time * 3.0 + audioMid * 10.0));
      float trebleRing = abs(sin(dist * 12.0 - time * 4.0 + audioTreble * 10.0));

      // Sharp ring edges
      bassRing = smoothstep(0.8, 1.0, bassRing);
      midRing = smoothstep(0.8, 1.0, midRing);
      trebleRing = smoothstep(0.8, 1.0, trebleRing);

      // Central pulse based on overall amplitude
      float centerPulse = 1.0 - smoothstep(0.0, 0.5 + audioAmplitude * 0.5, dist);
      centerPulse *= (sin(time * 4.0) * 0.5 + 0.5) + audioAmplitude;

      // Color for each frequency band
      vec3 bassColor = vec3(1.0, 0.2, 0.3) * bassRing * audioBass;
      vec3 midColor = vec3(0.3, 1.0, 0.5) * midRing * audioMid;
      vec3 trebleColor = vec3(0.3, 0.5, 1.0) * trebleRing * audioTreble;
      vec3 centerColor = vec3(1.0, 1.0, 1.0) * centerPulse;

      // Combine all elements
      vec3 finalColor = bassColor + midColor + trebleColor + centerColor;

      // Add background glow
      float glow = (1.0 - dist) * audioAmplitude * 0.3;
      finalColor += vec3(0.1, 0.1, 0.2) * glow;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

export default AudioPulseShaderMaterial;
