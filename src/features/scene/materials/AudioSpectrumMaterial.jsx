import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Audio Spectrum Shader Material
 * Visualizes frequency spectrum as a horizontal gradient
 * Left = Bass, Center = Mid, Right = Treble
 */
const AudioSpectrumShaderMaterial = shaderMaterial(
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

    // HSV to RGB conversion
    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void main() {
      vec2 uv = vUv;

      // Divide horizontal space into three frequency bands
      float bandWidth = 1.0 / 3.0;
      float band = floor(uv.x / bandWidth);
      float localX = fract(uv.x / bandWidth);

      float intensity;
      float hue;

      if (band < 1.0) {
        // Bass (left third) - Red/Orange
        intensity = audioBass;
        hue = 0.0 + audioBass * 0.1; // Red to orange
      } else if (band < 2.0) {
        // Mid (middle third) - Green/Yellow
        intensity = audioMid;
        hue = 0.3 + audioMid * 0.1; // Green to yellow
      } else {
        // Treble (right third) - Blue/Cyan
        intensity = audioTreble;
        hue = 0.6 + audioTreble * 0.1; // Blue to cyan
      }

      // Create vertical bars
      float barPattern = sin(localX * 20.0 + time * 2.0) * 0.5 + 0.5;
      float heightMask = smoothstep(1.0 - intensity, 1.0, uv.y);

      // Add wave effect
      float wave = sin(uv.x * 10.0 - time * 3.0 + audioAmplitude * 5.0) * 0.1;
      heightMask = smoothstep(1.0 - intensity + wave, 1.0, uv.y);

      // Color based on frequency band
      vec3 color = hsv2rgb(vec3(hue, 0.8, intensity));

      // Apply height mask
      color *= heightMask;

      // Add brightness pulse
      color += vec3(audioAmplitude * 0.3);

      // Add subtle gradient overlay
      float gradient = 1.0 - abs(uv.y - 0.5) * 0.5;
      color *= gradient;

      // Background color
      vec3 bgColor = vec3(0.05, 0.05, 0.1);
      color = mix(bgColor, color, heightMask);

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

AudioSpectrumShaderMaterial.depthTest = false;
AudioSpectrumShaderMaterial.depthWrite = false;
AudioSpectrumShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ AudioSpectrumShaderMaterial });

export default AudioSpectrumShaderMaterial;
