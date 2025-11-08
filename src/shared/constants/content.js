/**
 * Content type constants
 * These map to material IDs in the MaterialRegistry
 */

export const CONTENT_TYPES = {
  // Basic patterns
  CHECKERBOARD: 'checkerboard',
  GRID: 'grid',

  // Solid colors
  WHITE: 'white',
  RED: 'red',
  GREEN: 'green',
  BLUE: 'blue',

  // Animated effects
  ANIMATED_GRADIENT: 'animated-gradient',
  ROTATING_COLORS: 'rotating-colors',
  PLASMA: 'plasma',
  WAVES: 'waves',
  NOISE: 'noise',
  FIRE: 'fire',
  RAINBOW: 'rainbow',
  KALEIDOSCOPE: 'kaleidoscope',
  GLITCH: 'glitch',
  SPIRAL: 'spiral',

  // Audio-reactive effects
  AUDIO_WAVES: 'audio-waves',
  AUDIO_PULSE: 'audio-pulse',
  AUDIO_SPECTRUM: 'audio-spectrum',
  AUDIO_BARS: 'audio-bars',

  // Media
  IMAGE: 'image',

  // Custom
  CUSTOM_SHADER: 'custom-shader'
};

/**
 * Content type categories
 */
export const CONTENT_CATEGORIES = {
  BASIC: 'basic',
  COLORS: 'colors',
  ANIMATED: 'animated',
  AUDIO: 'audio',
  MEDIA: 'media',
  CUSTOM: 'custom'
};
