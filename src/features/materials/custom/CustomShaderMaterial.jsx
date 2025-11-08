import React, { useRef, useEffect, useMemo } from 'react';
import { ShaderMaterial } from 'three';
import { useFrame } from '@react-three/fiber';
import { MaterialRegistry } from '../../../core/materials/MaterialRegistry';

/**
 * CustomShaderMaterial - Dynamic shader material for user-editable shaders
 * Compiles and renders custom GLSL shaders with real-time updates
 */
export function CustomShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms = {},
  side,
  depthTest,
  depthWrite
}) {
  const materialRef = useRef();

  // Create shader material with user-provided code
  const material = useMemo(() => {
    try {
      // Ensure we have the time uniform for animations
      const shaderUniforms = {
        time: { value: 0 },
        ...Object.fromEntries(
          Object.entries(uniforms).map(([key, value]) => [
            key,
            { value: typeof value === 'object' && value.value !== undefined ? value.value : value }
          ])
        )
      };

      return new ShaderMaterial({
        uniforms: shaderUniforms,
        vertexShader: vertexShader || `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: fragmentShader || `
          varying vec2 vUv;
          void main() {
            gl_FragColor = vec4(vUv.x, vUv.y, 0.5, 1.0);
          }
        `,
        side,
        depthTest,
        depthWrite
      });
    } catch (error) {
      console.error('Shader compilation error:', error);
      // Return error material (magenta color to indicate error)
      return new ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
          void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          void main() {
            gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
          }
        `,
        side,
        depthTest,
        depthWrite
      });
    }
  }, [vertexShader, fragmentShader, uniforms, side, depthTest, depthWrite]);

  // Update material reference
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current = material;
    }
  }, [material]);

  // Animation loop - update time uniform
  useFrame((state, delta) => {
    if (material && material.uniforms && material.uniforms.time) {
      material.uniforms.time.value += delta;
    }
  });

  return <primitive object={material} ref={materialRef} attach="material" />;
}

// Register material with MaterialRegistry
MaterialRegistry.register({
  id: 'custom-shader',
  name: 'Custom Shader',
  category: 'custom',
  component: CustomShaderMaterial,
  props: {
    time: { type: 'float', default: 0 },
    vertexShader: { type: 'string', default: '' },
    fragmentShader: { type: 'string', default: '' },
    uniforms: { type: 'object', default: {} }
  },
  audioReactive: false,
  description: 'User-defined custom shader'
});

export default CustomShaderMaterial;
