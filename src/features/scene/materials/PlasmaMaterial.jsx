import { SHADER_DEFINITIONS } from './shaderDefinitions';
import { createShaderMaterial } from './shaderMaterialFactory';

/**
 * Plasma Shader Material
 * Creates a classic plasma effect with flowing colors
 */
const PlasmaShaderMaterial = createShaderMaterial(
  'PlasmaShaderMaterial',
  SHADER_DEFINITIONS.PLASMA
);

export default PlasmaShaderMaterial;
