import { SHADER_DEFINITIONS } from './shaderDefinitions';
import { createShaderMaterial } from './shaderMaterialFactory';

/**
 * Kaleidoscope Shader Material
 * Creates a symmetric kaleidoscope pattern
 */
const KaleidoscopeShaderMaterial = createShaderMaterial(
  'KaleidoscopeShaderMaterial',
  SHADER_DEFINITIONS.KALEIDOSCOPE
);

export default KaleidoscopeShaderMaterial;
