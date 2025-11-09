import { SHADER_DEFINITIONS } from './shaderDefinitions';
import { createShaderMaterial } from './shaderMaterialFactory';

/**
 * Rainbow Spectrum Shader Material
 * Creates a flowing rainbow gradient effect
 */
const RainbowShaderMaterial = createShaderMaterial(
  'RainbowShaderMaterial',
  SHADER_DEFINITIONS.RAINBOW
);

export default RainbowShaderMaterial;
