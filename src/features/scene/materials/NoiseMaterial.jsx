import { SHADER_DEFINITIONS } from './shaderDefinitions';
import { createShaderMaterial } from './shaderMaterialFactory';

/**
 * Noise Shader Material
 * Creates animated noise patterns using simplex-like noise
 */
const NoiseShaderMaterial = createShaderMaterial(
  'NoiseShaderMaterial',
  SHADER_DEFINITIONS.NOISE
);

export default NoiseShaderMaterial;
