import { SHADER_DEFINITIONS } from './shaderDefinitions';
import { createShaderMaterial } from './shaderMaterialFactory';

/**
 * Fire Shader Material
 * Creates a realistic fire/flame effect
 */
const FireShaderMaterial = createShaderMaterial(
  'FireShaderMaterial',
  SHADER_DEFINITIONS.FIRE
);

export default FireShaderMaterial;
