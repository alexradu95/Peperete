import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Audio Bars Shader Material
 * Classic audio visualizer with vertical bars
 * Bars height responds to audio frequencies
 */
const AudioBarsShaderMaterial = shaderMaterial(
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

    // Simple noise function
    float hash(float n) {
      return fract(sin(n) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;

      // Number of bars
      float numBars = 32.0;
      float barIndex = floor(uv.x * numBars);
      float localX = fract(uv.x * numBars);

      // Bar width (with gap)
      float barWidth = 0.8;
      float isBar = step(localX, barWidth);

      // Calculate bar height based on position
      // Left side = bass, middle = mid, right = treble
      float normalizedPos = barIndex / numBars;
      float barHeight;

      if (normalizedPos < 0.33) {
        // Bass region
        float bassIntensity = audioBass * (1.0 + hash(barIndex + time * 0.5) * 0.3);
        barHeight = bassIntensity * 0.8;
      } else if (normalizedPos < 0.66) {
        // Mid region
        float midIntensity = audioMid * (1.0 + hash(barIndex + time * 0.7) * 0.3);
        barHeight = midIntensity * 0.8;
      } else {
        // Treble region
        float trebleIntensity = audioTreble * (1.0 + hash(barIndex + time * 0.9) * 0.3);
        barHeight = trebleIntensity * 0.8;
      }

      // Add some animation to bars
      barHeight += sin(time * 3.0 + barIndex * 0.5) * audioAmplitude * 0.1;
      barHeight = clamp(barHeight, 0.0, 1.0);

      // Vertical position check (bars grow from bottom)
      float isLit = step(1.0 - barHeight, uv.y) * isBar;

      // Color gradient based on height
      vec3 lowColor = vec3(0.0, 0.5, 1.0);    // Blue (bottom)
      vec3 midColor = vec3(0.0, 1.0, 0.5);    // Cyan (middle)
      vec3 highColor = vec3(1.0, 1.0, 0.0);   // Yellow (high)
      vec3 peakColor = vec3(1.0, 0.2, 0.2);   // Red (peak)

      vec3 barColor;
      if (uv.y < 0.33) {
        barColor = mix(lowColor, midColor, uv.y * 3.0);
      } else if (uv.y < 0.66) {
        barColor = mix(midColor, highColor, (uv.y - 0.33) * 3.0);
      } else {
        barColor = mix(highColor, peakColor, (uv.y - 0.66) * 3.0);
      }

      // Add glow effect
      float glow = (1.0 - abs(localX - barWidth * 0.5) / barWidth) * audioAmplitude * 0.3;
      barColor += vec3(glow);

      // Peak hold effect
      float peakIndicator = smoothstep(0.02, 0.0, abs(uv.y - barHeight)) * isBar;
      barColor += vec3(1.0) * peakIndicator;

      // Final color
      vec3 finalColor = barColor * isLit;

      // Background
      vec3 bgColor = vec3(0.05, 0.05, 0.1);
      finalColor = mix(bgColor, finalColor, isLit);

      // Add subtle grid lines
      float gridLine = step(0.95, fract(uv.y * 20.0));
      finalColor += vec3(0.1) * gridLine * audioAmplitude * 0.5;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

AudioBarsShaderMaterial.depthTest = false;
AudioBarsShaderMaterial.depthWrite = false;
AudioBarsShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ AudioBarsShaderMaterial });

export default AudioBarsShaderMaterial;
