import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Shader Definition Interface
 * Defines the structure for shader configurations
 */
export interface ShaderDefinition {
  name?: string;
  description?: string;
  uniforms: Record<string, any>;
  vertexShader: string;
  fragmentShader: string;
}

/**
 * Shader Material Factory
 * Creates and configures shader materials with consistent settings
 *
 * This factory eliminates duplication across 15+ material components by
 * centralizing the material creation, configuration, and R3F extension logic.
 *
 * @param materialName - The name to use when extending R3F (e.g., 'AnimatedGradientShaderMaterial')
 * @param uniforms - Uniform values for the shader
 * @param vertexShader - GLSL vertex shader code
 * @param fragmentShader - GLSL fragment shader code
 * @returns The configured shader material class
 *
 * @example
 * ```typescript
 * // Using SHADER_DEFINITIONS
 * const material = createShaderMaterial(
 *   'AnimatedGradientShaderMaterial',
 *   SHADER_DEFINITIONS.ANIMATED_GRADIENT
 * );
 *
 * // Using inline definition
 * const material = createShaderMaterial(
 *   'CustomMaterial',
 *   { time: 0 },
 *   vertexShaderCode,
 *   fragmentShaderCode
 * );
 * ```
 */
export function createShaderMaterial(
  materialName: string,
  uniformsOrDefinition: Record<string, any> | ShaderDefinition,
  vertexShader?: string,
  fragmentShader?: string
) {
  // Support both definition object and inline parameters
  let uniforms: Record<string, any>;
  let vertex: string;
  let fragment: string;

  if (vertexShader && fragmentShader) {
    // Inline parameters
    uniforms = uniformsOrDefinition as Record<string, any>;
    vertex = vertexShader;
    fragment = fragmentShader;
  } else {
    // ShaderDefinition object
    const definition = uniformsOrDefinition as ShaderDefinition;
    uniforms = definition.uniforms;
    vertex = definition.vertexShader;
    fragment = definition.fragmentShader;
  }

  // Create the shader material using R3F Drei
  const material = shaderMaterial(uniforms, vertex, fragment);

  // Apply standard settings for all shader materials
  // These ensure proper rendering in the projection mapping context
  material.depthTest = false;  // Disable depth testing for overlay rendering
  material.depthWrite = false; // Prevent writing to depth buffer
  material.side = THREE.DoubleSide; // Render both sides of geometry

  // Extend React Three Fiber with this material
  // This makes it available as a JSX component (e.g., <animatedGradientShaderMaterial />)
  extend({ [materialName]: material });

  return material;
}
