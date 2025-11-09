import { SHADER_DEFINITIONS } from './shaderDefinitions';
import { createShaderMaterial } from './shaderMaterialFactory';

/**
 * Waves Shader Material
 * Creates animated wave/ripple effects
 */
const WavesShaderMaterial = createShaderMaterial(
  'WavesShaderMaterial',
  SHADER_DEFINITIONS.WAVES
);

export default WavesShaderMaterial;
