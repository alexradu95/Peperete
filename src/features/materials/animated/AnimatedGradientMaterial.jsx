import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { MaterialRegistry } from '../../../core/materials/MaterialRegistry';

/**
 * Animated Gradient Shader Material
 * Creates a flowing gradient animation using sine waves
 */
const AnimatedGradientShaderMaterial = shaderMaterial(
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

    void main() {
      vec2 uv = vUv;

      // Animated gradient
      float r = 0.5 + 0.5 * sin(time + uv.x * 3.14159);
      float g = 0.5 + 0.5 * sin(time + uv.y * 3.14159 + 2.0);
      float b = 0.5 + 0.5 * sin(time + (uv.x + uv.y) * 3.14159 + 4.0);

      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `
);

AnimatedGradientShaderMaterial.depthTest = false;
AnimatedGradientShaderMaterial.depthWrite = false;
AnimatedGradientShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ AnimatedGradientShaderMaterial });

// Register material with MaterialRegistry
MaterialRegistry.register({
  id: 'animated-gradient',
  name: 'Animated Gradient',
  category: 'animated',
  component: AnimatedGradientShaderMaterial,
  props: {
    time: { type: 'float', default: 0 }
  },
  audioReactive: false,
  description: 'Flowing gradient animation using sine waves'
});

export default AnimatedGradientShaderMaterial;
