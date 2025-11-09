import { SHADER_DEFINITIONS } from './shaderDefinitions';
import { createShaderMaterial } from './shaderMaterialFactory';

/**
 * Glitch Shader Material
 * Creates a digital glitch/corruption effect
 */
const GlitchShaderMaterial = createShaderMaterial(
  'GlitchShaderMaterial',
  SHADER_DEFINITIONS.GLITCH
);

export default GlitchShaderMaterial;
