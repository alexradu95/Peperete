import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { MaterialRegistry } from '../../../core/materials/MaterialRegistry';

/**
 * Kaleidoscope Shader Material
 * Creates a symmetric kaleidoscope pattern
 */
const KaleidoscopeShaderMaterial = shaderMaterial(
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

    #define PI 3.14159265359

    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void main() {
      vec2 uv = vUv - 0.5;

      // Convert to polar coordinates
      float radius = length(uv);
      float angle = atan(uv.y, uv.x);

      // Number of kaleidoscope segments
      float segments = 8.0;

      // Create symmetry
      angle = mod(angle, 2.0 * PI / segments);
      angle = abs(angle - PI / segments);

      // Rotate over time
      angle += time * 0.5;

      // Create pattern
      float pattern = sin(radius * 20.0 + time) * 0.5 + 0.5;
      pattern *= sin(angle * 10.0) * 0.5 + 0.5;
      pattern += cos(radius * 15.0 - time * 2.0) * 0.3;

      // Create color based on angle and radius
      float hue = fract(angle / (2.0 * PI) + radius + time * 0.1);
      vec3 color = hsv2rgb(vec3(hue, 0.8, pattern));

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

KaleidoscopeShaderMaterial.depthTest = false;
KaleidoscopeShaderMaterial.depthWrite = false;
KaleidoscopeShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ KaleidoscopeShaderMaterial });

// Register material with MaterialRegistry
MaterialRegistry.register({
  id: 'kaleidoscope',
  name: 'Kaleidoscope',
  category: 'animated',
  component: KaleidoscopeShaderMaterial,
  props: {
    time: { type: 'float', default: 0 }
  },
  audioReactive: false,
  description: 'Symmetric kaleidoscope pattern'
});

export default KaleidoscopeShaderMaterial;
