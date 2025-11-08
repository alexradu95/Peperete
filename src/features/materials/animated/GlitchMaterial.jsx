import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { MaterialRegistry } from '../../../core/materials/MaterialRegistry';

/**
 * Glitch Shader Material
 * Creates a digital glitch/corruption effect
 */
const GlitchShaderMaterial = shaderMaterial(
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

    void main() {
      vec2 uv = vUv;

      // Random glitch intervals
      float glitchStrength = step(0.95, random(vec2(floor(time * 4.0))));

      // Horizontal distortion
      float lineGlitch = step(0.98, random(vec2(floor(uv.y * 20.0), floor(time * 10.0))));
      uv.x += lineGlitch * glitchStrength * (random(vec2(time)) - 0.5) * 0.3;

      // Block displacement
      float blockY = floor(uv.y * 8.0) / 8.0;
      float blockGlitch = step(0.9, random(vec2(blockY, floor(time * 5.0))));
      uv.x += blockGlitch * glitchStrength * (random(vec2(time * 2.0)) - 0.5) * 0.2;

      // RGB split
      float splitAmount = glitchStrength * 0.03;
      vec2 uvR = uv + vec2(splitAmount, 0.0);
      vec2 uvG = uv;
      vec2 uvB = uv - vec2(splitAmount, 0.0);

      // Base pattern
      float patternR = step(0.5, fract(uvR.x * 10.0 + uvR.y * 10.0 + time));
      float patternG = step(0.5, fract(uvG.x * 10.0 + uvG.y * 10.0 + time * 1.1));
      float patternB = step(0.5, fract(uvB.x * 10.0 + uvB.y * 10.0 + time * 0.9));

      vec3 color = vec3(patternR, patternG, patternB);

      // Scan lines
      color *= 0.9 + 0.1 * sin(uv.y * 200.0 + time * 10.0);

      // Random flicker
      color *= 0.8 + 0.2 * random(vec2(floor(time * 30.0)));

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

GlitchShaderMaterial.depthTest = false;
GlitchShaderMaterial.depthWrite = false;
GlitchShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ GlitchShaderMaterial });

// Register material with MaterialRegistry
MaterialRegistry.register({
  id: 'glitch',
  name: 'Glitch',
  category: 'animated',
  component: GlitchShaderMaterial,
  render: (props) => <glitchShaderMaterial {...props} />,
  props: {
    time: { type: 'float', default: 0 }
  },
  audioReactive: false,
  description: 'Digital glitch and corruption effect'
});

export default GlitchShaderMaterial;
