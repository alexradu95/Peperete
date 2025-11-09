import { SHADER_DEFINITIONS } from './shaderDefinitions';
import { createShaderMaterial } from './shaderMaterialFactory';

/**
 * Spiral Shader Material
 * Creates a hypnotic spiral pattern
 */
const SpiralShaderMaterial = createShaderMaterial(
  'SpiralShaderMaterial',
  SHADER_DEFINITIONS.SPIRAL
);

export default SpiralShaderMaterial;
