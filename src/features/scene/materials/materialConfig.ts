import { CONTENT_TYPES } from '../../../shared/utils/constants';
import type * as THREE from 'three';

/**
 * Material Configuration Interface
 * Defines how each content type maps to a material
 */
export interface MaterialConfig {
  /**
   * The type of material component to use
   * - 'meshBasicMaterial': Built-in Three.js basic material
   * - 'image': Image texture material
   * - 'customShader': User-defined custom shader
   * - Other strings: Custom shader material component names (e.g., 'animatedGradient')
   */
  type: string;

  /**
   * Whether this material requires a ref for animation updates
   */
  requiresRef?: boolean;

  /**
   * Function to generate material props dynamically
   * @param context - Context object with helpers like createCheckerboardTexture
   * @param surface - The surface data object
   * @returns Props to pass to the material component
   */
  getProps?: (context: any, surface: any) => Record<string, any>;

  /**
   * Static props (alternative to getProps for simple cases)
   */
  staticProps?: Record<string, any>;
}

/**
 * Material Configuration Registry
 * Single source of truth for content type → material mapping
 *
 * This eliminates the 142-line switch statement in Surface.jsx
 * and makes it trivial to add new material types.
 */
export const MATERIAL_CONFIG: Record<string, MaterialConfig> = {
  // Procedural Textures
  [CONTENT_TYPES.CHECKERBOARD]: {
    type: 'meshBasicMaterial',
    requiresRef: false,
    getProps: (context) => ({
      map: context.createCheckerboardTexture()
    })
  },

  [CONTENT_TYPES.GRID]: {
    type: 'meshBasicMaterial',
    requiresRef: false,
    getProps: (context) => ({
      map: context.createGridTexture()
    })
  },

  // Solid Colors
  [CONTENT_TYPES.WHITE]: {
    type: 'meshBasicMaterial',
    requiresRef: false,
    getProps: (context, surface) => ({
      color: context.getColorValue(surface.contentType)
    })
  },

  [CONTENT_TYPES.RED]: {
    type: 'meshBasicMaterial',
    requiresRef: false,
    getProps: (context, surface) => ({
      color: context.getColorValue(surface.contentType)
    })
  },

  [CONTENT_TYPES.GREEN]: {
    type: 'meshBasicMaterial',
    requiresRef: false,
    getProps: (context, surface) => ({
      color: context.getColorValue(surface.contentType)
    })
  },

  [CONTENT_TYPES.BLUE]: {
    type: 'meshBasicMaterial',
    requiresRef: false,
    getProps: (context, surface) => ({
      color: context.getColorValue(surface.contentType)
    })
  },

  // Animated Shaders
  [CONTENT_TYPES.ANIMATED_GRADIENT]: {
    type: 'animatedGradient',
    requiresRef: true,
    staticProps: {}
  },

  [CONTENT_TYPES.ROTATING_COLORS]: {
    type: 'rotatingColors',
    requiresRef: true,
    staticProps: {}
  },

  [CONTENT_TYPES.PLASMA]: {
    type: 'plasma',
    requiresRef: true,
    staticProps: {}
  },

  [CONTENT_TYPES.WAVES]: {
    type: 'waves',
    requiresRef: true,
    staticProps: {}
  },

  [CONTENT_TYPES.NOISE]: {
    type: 'noise',
    requiresRef: true,
    staticProps: {}
  },

  [CONTENT_TYPES.FIRE]: {
    type: 'fire',
    requiresRef: true,
    staticProps: {}
  },

  [CONTENT_TYPES.RAINBOW]: {
    type: 'rainbow',
    requiresRef: true,
    staticProps: {}
  },

  [CONTENT_TYPES.KALEIDOSCOPE]: {
    type: 'kaleidoscope',
    requiresRef: true,
    staticProps: {}
  },

  [CONTENT_TYPES.GLITCH]: {
    type: 'glitch',
    requiresRef: true,
    staticProps: {}
  },

  [CONTENT_TYPES.SPIRAL]: {
    type: 'spiral',
    requiresRef: true,
    staticProps: {}
  },

  // Audio-Reactive Shaders
  [CONTENT_TYPES.AUDIO_WAVES]: {
    type: 'audioWaves',
    requiresRef: true,
    staticProps: {}
  },

  [CONTENT_TYPES.AUDIO_PULSE]: {
    type: 'audioPulse',
    requiresRef: true,
    staticProps: {}
  },

  [CONTENT_TYPES.AUDIO_SPECTRUM]: {
    type: 'audioSpectrum',
    requiresRef: true,
    staticProps: {}
  },

  [CONTENT_TYPES.AUDIO_BARS]: {
    type: 'audioBars',
    requiresRef: true,
    staticProps: {}
  },

  // Special Materials
  [CONTENT_TYPES.CUSTOM_SHADER]: {
    type: 'customShader',
    requiresRef: false,
    getProps: (context, surface) => ({
      shaderData: surface.contentData?.shaderData
    })
  },

  [CONTENT_TYPES.IMAGE]: {
    type: 'image',
    requiresRef: false,
    getProps: (context, surface) => ({
      imageUrl: surface.contentData?.imageUrl
    })
  }
};

/**
 * Default material configuration for unknown content types
 */
export const DEFAULT_MATERIAL_CONFIG: MaterialConfig = {
  type: 'meshBasicMaterial',
  requiresRef: false,
  staticProps: {
    color: 0xffffff
  }
};

/**
 * Get material configuration for a given content type
 * @param contentType - The content type to look up
 * @returns The material configuration, or default if not found
 */
export function getMaterialConfig(contentType: string): MaterialConfig {
  return MATERIAL_CONFIG[contentType] || DEFAULT_MATERIAL_CONFIG;
}
