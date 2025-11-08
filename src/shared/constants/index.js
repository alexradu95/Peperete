/**
 * Constants barrel export
 *
 * Re-exports all constants from domain-specific files
 */

// App-level constants
export {
  APP_MODES,
  KEYBOARD_SHORTCUTS,
  STORAGE_KEYS
} from './app.js';

// Content type constants
export {
  CONTENT_TYPES,
  CONTENT_CATEGORIES
} from './content.js';

// Geometry constants
export {
  GEOMETRY_TYPES,
  GRID_SIZE,
  GEOMETRY_SUBDIVISIONS,
  getDefaultCorners,
  DEFAULT_SURFACE_CONFIG
} from './geometry.js';
