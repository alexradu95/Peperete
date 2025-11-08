import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { MaterialRegistry } from '../../../core/materials/MaterialRegistry';

/**
 * Noise Shader Material
 * Creates animated noise patterns using simplex-like noise
 */
const NoiseShaderMaterial = shaderMaterial(
  // Uniforms
  { time: 0 },
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
    varying vec2 vUv;

    // Simple pseudo-random function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    // 2D Noise
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);

      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    // Fractal Brownian Motion
    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;

      for (int i = 0; i < 5; i++) {
        value += amplitude * noise(st * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 uv = vUv * 5.0;

      float n = fbm(uv + time * 0.3);

      vec3 color1 = vec3(0.2, 0.0, 0.4);
      vec3 color2 = vec3(0.8, 0.3, 0.9);
      vec3 color3 = vec3(0.1, 0.6, 0.8);

      vec3 finalColor = mix(color1, color2, n);
      finalColor = mix(finalColor, color3, fbm(uv * 2.0 - time * 0.2));

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

NoiseShaderMaterial.depthTest = false;
NoiseShaderMaterial.depthWrite = false;
NoiseShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ NoiseShaderMaterial });

// Register material with MaterialRegistry
MaterialRegistry.register({
  id: 'noise',
  name: 'Noise',
  category: 'animated',
  component: NoiseShaderMaterial,
  props: {
    time: { type: 'float', default: 0 }
  },
  audioReactive: false,
  description: 'Animated noise patterns using fractal brownian motion'
});

export default NoiseShaderMaterial;
