import { SHADER_DEFINITIONS } from './shaderDefinitions';
import { createShaderMaterial } from './shaderMaterialFactory';

/**
 * Rotating Colors Shader Material
 * Creates a rotating color wheel effect using HSV
 */
const RotatingColorsShaderMaterial = createShaderMaterial(
  'RotatingColorsShaderMaterial',
  SHADER_DEFINITIONS.ROTATING_COLORS
);

export default RotatingColorsShaderMaterial;
