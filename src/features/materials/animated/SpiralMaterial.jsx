import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { MaterialRegistry } from '../../../core/materials/MaterialRegistry';

/**
 * Spiral Shader Material
 * Creates a hypnotic spiral pattern
 */
const SpiralShaderMaterial = shaderMaterial(
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

      // Polar coordinates
      float radius = length(uv);
      float angle = atan(uv.y, uv.x);

      // Create spiral
      float spiral = radius * 10.0 - angle * 3.0 - time * 2.0;
      float pattern = sin(spiral) * 0.5 + 0.5;

      // Add secondary spiral
      float spiral2 = radius * 15.0 + angle * 2.0 + time * 1.5;
      pattern += (sin(spiral2) * 0.5 + 0.5) * 0.5;

      // Create color based on pattern and radius
      float hue = fract(radius * 2.0 + time * 0.1);
      float saturation = 0.7 + pattern * 0.3;
      float value = pattern;

      vec3 color = hsv2rgb(vec3(hue, saturation, value));

      // Add some pulsing
      color *= 0.8 + 0.2 * sin(time * 2.0);

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

SpiralShaderMaterial.depthTest = false;
SpiralShaderMaterial.depthWrite = false;
SpiralShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ SpiralShaderMaterial });

// Register material with MaterialRegistry
MaterialRegistry.register({
  id: 'spiral',
  name: 'Spiral',
  category: 'animated',
  component: SpiralShaderMaterial,
  elementName: 'spiralShaderMaterial',
  props: {
    time: { type: 'float', default: 0 }
  },
  audioReactive: false,
  description: 'Hypnotic spiral pattern'
});

export default SpiralShaderMaterial;
