import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { MaterialRegistry } from '../../../core/materials/MaterialRegistry';

/**
 * Fire Shader Material
 * Creates a realistic fire/flame effect
 */
const FireShaderMaterial = shaderMaterial(
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

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

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

    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 6; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 uv = vUv;

      // Create flame shape - stronger at bottom
      vec2 fireUV = vec2(uv.x, 1.0 - uv.y);

      // Rising flames
      float n = fbm(vec2(fireUV.x * 3.0, fireUV.y * 2.0 - time * 2.0));
      n += fbm(vec2(fireUV.x * 5.0, fireUV.y * 3.0 - time * 3.0)) * 0.5;

      // Fire intensity - stronger at bottom
      float intensity = n * (1.0 - fireUV.y);
      intensity = pow(intensity, 1.5);

      // Fire colors: dark red -> orange -> yellow -> white
      vec3 color = vec3(0.0);

      if (intensity > 0.8) {
        color = vec3(1.0, 1.0, 0.9); // White-yellow (hottest)
      } else if (intensity > 0.5) {
        color = mix(vec3(1.0, 0.7, 0.0), vec3(1.0, 1.0, 0.9), (intensity - 0.5) / 0.3);
      } else if (intensity > 0.2) {
        color = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 0.7, 0.0), (intensity - 0.2) / 0.3);
      } else {
        color = mix(vec3(0.3, 0.0, 0.0), vec3(1.0, 0.2, 0.0), intensity / 0.2);
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

FireShaderMaterial.depthTest = false;
FireShaderMaterial.depthWrite = false;
FireShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ FireShaderMaterial });

// Register material with MaterialRegistry
MaterialRegistry.register({
  id: 'fire',
  name: 'Fire',
  category: 'animated',
  component: FireShaderMaterial,
  elementName: 'fireShaderMaterial',
  props: {
    time: { type: 'float', default: 0 }
  },
  audioReactive: false,
  description: 'Realistic fire and flame effect'
});

export default FireShaderMaterial;
