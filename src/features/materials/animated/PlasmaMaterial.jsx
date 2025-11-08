import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { MaterialRegistry } from '../../../core/materials/MaterialRegistry';

/**
 * Plasma Shader Material
 * Creates a classic plasma effect with flowing colors
 */
const PlasmaShaderMaterial = shaderMaterial(
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
      vec2 uv = vUv * 10.0;

      float v1 = sin(uv.x + time);
      float v2 = sin(uv.y + time);
      float v3 = sin(uv.x + uv.y + time);
      float v4 = sin(sqrt(uv.x * uv.x + uv.y * uv.y) + time);

      float plasma = v1 + v2 + v3 + v4;

      vec3 color1 = vec3(1.0, 0.0, 0.5);
      vec3 color2 = vec3(0.0, 1.0, 0.5);
      vec3 color3 = vec3(0.5, 0.0, 1.0);

      vec3 finalColor = mix(color1, color2, sin(plasma * 0.5) * 0.5 + 0.5);
      finalColor = mix(finalColor, color3, cos(plasma * 0.3) * 0.5 + 0.5);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

PlasmaShaderMaterial.depthTest = false;
PlasmaShaderMaterial.depthWrite = false;
PlasmaShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ PlasmaShaderMaterial });

// Register material with MaterialRegistry
MaterialRegistry.register({
  id: 'plasma',
  name: 'Plasma',
  category: 'animated',
  component: PlasmaShaderMaterial,
  // Render function that returns the JSX element
  render: (props) => <plasmaShaderMaterial {...props} />,
  props: {
    time: { type: 'float', default: 0, description: 'Animation time' }
  },
  audioReactive: false,
  description: 'Classic plasma effect with flowing colors'
});

export default PlasmaShaderMaterial;
