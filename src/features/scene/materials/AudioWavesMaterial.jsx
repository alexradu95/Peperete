import { createShaderMaterial } from './shaderMaterialFactory';

/**
 * Audio Waves Shader Material
 * Creates wave patterns that respond to audio input
 * Waves speed and intensity controlled by audio amplitude
 */
const AudioWavesShaderMaterial = createShaderMaterial(
  'AudioWavesShaderMaterial',
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
      float dist = length(uv);

      // Audio-reactive parameters
      float speed = 3.0 + audioAmplitude * 5.0;
      float intensity = 1.0 + audioBass * 2.0;
      float frequency = 20.0 + audioFrequency * 30.0;

      // Create waves influenced by audio
      float wave1 = sin(dist * frequency - time * speed) * 0.5 + 0.5;
      float wave2 = sin(dist * (frequency * 0.75) - time * (speed * 1.5) + audioBass * 3.14) * 0.5 + 0.5;
      float wave3 = sin(dist * (frequency * 1.25) - time * (speed * 0.5) + audioMid * 3.14) * 0.5 + 0.5;

      float waves = (wave1 + wave2 + wave3) / 3.0;
      waves = pow(waves, 1.0 - audioAmplitude * 0.5); // Increase contrast with audio

      // Audio-reactive colors
      vec3 color1 = vec3(0.1 + audioBass * 0.3, 0.3 + audioMid * 0.3, 0.8 + audioTreble * 0.2);
      vec3 color2 = vec3(0.3 + audioTreble * 0.5, 0.8, 1.0);
      vec3 color3 = vec3(0.0, 0.5 + audioAmplitude * 0.5, 0.9);

      vec3 finalColor = mix(color1, color2, waves);
      finalColor = mix(finalColor, color3, sin(time + dist * 10.0 + audioAmplitude * 5.0) * 0.5 + 0.5);

      // Boost brightness with audio
      finalColor *= 1.0 + audioAmplitude * 0.5;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

export default AudioWavesShaderMaterial;
