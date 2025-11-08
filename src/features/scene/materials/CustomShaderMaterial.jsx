import { useRef, useEffect, useMemo } from 'react';
import { ShaderMaterial } from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * CustomShaderMaterial - A component that compiles and renders user-defined shaders
 * Supports real-time shader editing with error handling
 */
export function CustomShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms = {},
  onError = null
}) {
  const materialRef = useRef();

  // Create shader material with user-provided code
  const material = useMemo(() => {
    try {
      // Ensure we have time uniform for animations
      const mergedUniforms = {
        time: { value: 0.0 },
        ...uniforms
      };

      const mat = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: mergedUniforms,
        side: 2, // DoubleSide
        depthTest: false,
        depthWrite: false,
      });

      // Clear any previous errors
      if (onError) {
        onError(null);
      }

      return mat;
    } catch (error) {
      console.error('Shader compilation error:', error);
      if (onError) {
        onError(error.message);
      }

      // Return a fallback material (magenta to indicate error)
      return new ShaderMaterial({
        vertexShader: `
          void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          void main() {
            gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0); // Magenta error indicator
          }
        `,
        side: 2,
        depthTest: false,
        depthWrite: false,
      });
    }
  }, [vertexShader, fragmentShader, uniforms, onError]);

  // Update material reference
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current = material;
    }
  }, [material]);

  // Animate time uniform
  useFrame((state, delta) => {
    if (materialRef.current && materialRef.current.uniforms && materialRef.current.uniforms.time) {
      materialRef.current.uniforms.time.value += delta;
    }
  });

  return <primitive ref={materialRef} object={material} attach="material" />;
}
