import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Rotating Colors Shader Material
 * Creates a rotating color wheel effect using HSV
 */
const RotatingColorsShaderMaterial = shaderMaterial(
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

      // Center point
      vec2 center = vec2(0.5, 0.5);
      vec2 pos = uv - center;

      // Polar coordinates
      float angle = atan(pos.y, pos.x);
      float radius = length(pos);

      // Rotating hue based on angle and time
      float hue = (angle / 6.28318) + time * 0.2;
      hue = fract(hue);

      vec3 color = hsv2rgb(vec3(hue, 0.8, 1.0));

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

RotatingColorsShaderMaterial.depthTest = false;
RotatingColorsShaderMaterial.depthWrite = false;
RotatingColorsShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ RotatingColorsShaderMaterial });

export default RotatingColorsShaderMaterial;
