import { SHADER_DEFINITIONS } from './shaderDefinitions';
import { createShaderMaterial } from './shaderMaterialFactory';

/**
 * Animated Gradient Shader Material
 * Creates a flowing gradient animation using sine waves
 */
const AnimatedGradientShaderMaterial = createShaderMaterial(
  'AnimatedGradientShaderMaterial',
  SHADER_DEFINITIONS.ANIMATED_GRADIENT
);

export default AnimatedGradientShaderMaterial;
