/**
 * Shader Template Library
 * Pre-built shader examples that users can use as starting points for custom shaders
 * Now using unified shader definitions to ensure consistency across the application
 */

import { SHADER_DEFINITIONS } from './shaderDefinitions';

// Re-export the shader definitions as templates
// This ensures templates match exactly what's rendered in the built-in effects
export const SHADER_TEMPLATES = {
  BLANK: SHADER_DEFINITIONS.BLANK,
  ANIMATED_GRADIENT: SHADER_DEFINITIONS.ANIMATED_GRADIENT,
  PLASMA: SHADER_DEFINITIONS.PLASMA,
  WAVES: SHADER_DEFINITIONS.WAVES,
  RAINBOW: SHADER_DEFINITIONS.RAINBOW,
  KALEIDOSCOPE: SHADER_DEFINITIONS.KALEIDOSCOPE,
  FIRE: SHADER_DEFINITIONS.FIRE,
  ROTATING_COLORS: SHADER_DEFINITIONS.ROTATING_COLORS,
  NOISE: SHADER_DEFINITIONS.NOISE,
  SPIRAL: SHADER_DEFINITIONS.SPIRAL,
  GLITCH: SHADER_DEFINITIONS.GLITCH,
  CHECKERBOARD_ANIMATED: SHADER_DEFINITIONS.CHECKERBOARD_ANIMATED
};

/**
 * Get a template by key
 */
export function getTemplate(key) {
  return SHADER_TEMPLATES[key] || SHADER_TEMPLATES.BLANK;
}

/**
 * Get all template keys and names for UI dropdown
 */
export function getAllTemplates() {
  return Object.keys(SHADER_TEMPLATES).map(key => ({
    key,
    name: SHADER_TEMPLATES[key].name,
    description: SHADER_TEMPLATES[key].description
  }));
}
