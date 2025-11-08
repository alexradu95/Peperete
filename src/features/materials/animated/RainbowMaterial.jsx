import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { MaterialRegistry } from '../../../core/materials/MaterialRegistry';

/**
 * Rainbow Spectrum Shader Material
 * Creates a flowing rainbow gradient effect
 */
const RainbowShaderMaterial = shaderMaterial(
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

    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void main() {
      vec2 uv = vUv;

      // Diagonal rainbow flow
      float hue = fract(uv.x * 0.5 + uv.y * 0.5 + time * 0.1);

      // Add some wave motion
      hue += sin(uv.y * 10.0 + time) * 0.05;
      hue += cos(uv.x * 10.0 + time * 1.5) * 0.05;

      vec3 color = hsv2rgb(vec3(hue, 0.9, 1.0));

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

RainbowShaderMaterial.depthTest = false;
RainbowShaderMaterial.depthWrite = false;
RainbowShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ RainbowShaderMaterial });

// Register material with MaterialRegistry
MaterialRegistry.register({
  id: 'rainbow',
  name: 'Rainbow',
  category: 'animated',
  component: RainbowShaderMaterial,
  render: (props) => <rainbowShaderMaterial {...props} />,
  props: {
    time: { type: 'float', default: 0 }
  },
  audioReactive: false,
  description: 'Flowing rainbow gradient effect'
});

export default RainbowShaderMaterial;
