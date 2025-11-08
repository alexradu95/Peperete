import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { MaterialRegistry } from '../../../core/materials/MaterialRegistry';

/**
 * Waves Shader Material
 * Creates animated wave/ripple effects
 */
const WavesShaderMaterial = shaderMaterial(
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
      vec2 uv = vUv - 0.5;

      float dist = length(uv);
      float wave1 = sin(dist * 20.0 - time * 3.0) * 0.5 + 0.5;
      float wave2 = sin(dist * 15.0 - time * 2.0 + 1.5) * 0.5 + 0.5;
      float wave3 = sin(dist * 25.0 - time * 4.0 + 3.0) * 0.5 + 0.5;

      float waves = (wave1 + wave2 + wave3) / 3.0;

      vec3 color1 = vec3(0.1, 0.3, 0.8);
      vec3 color2 = vec3(0.3, 0.8, 1.0);
      vec3 color3 = vec3(0.0, 0.5, 0.9);

      vec3 finalColor = mix(color1, color2, waves);
      finalColor = mix(finalColor, color3, sin(time + dist * 10.0) * 0.5 + 0.5);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

WavesShaderMaterial.depthTest = false;
WavesShaderMaterial.depthWrite = false;
WavesShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ WavesShaderMaterial });

// Register material with MaterialRegistry
MaterialRegistry.register({
  id: 'waves',
  name: 'Waves',
  category: 'animated',
  component: WavesShaderMaterial,
  props: {
    time: { type: 'float', default: 0 }
  },
  audioReactive: false,
  description: 'Animated wave and ripple effects'
});

export default WavesShaderMaterial;
