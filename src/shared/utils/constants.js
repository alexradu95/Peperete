/**
 * Application-wide constants
 */

export const APP_MODES = {
  CALIBRATION: 'calibration',
  PLAYBACK: 'playback'
};

export const CONTENT_TYPES = {
  CHECKERBOARD: 'checkerboard',
  GRID: 'grid',
  ANIMATED_GRADIENT: 'animated-gradient',
  ROTATING_COLORS: 'rotating-colors',
  WHITE: 'white',
  RED: 'red',
  GREEN: 'green',
  BLUE: 'blue',
  IMAGE: 'image'
};

/**
 * Get default corners based on current window size
 * Places corners in the center with some margin
 */
export function getDefaultCorners() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Calculate center area with margin
  const margin = Math.min(width, height) * 0.15; // 15% margin
  const centerWidth = width * 0.5;
  const centerHeight = height * 0.5;

  const centerX = width / 2;
  const centerY = height / 2;

  return {
    topLeft: {
      x: centerX - centerWidth / 2,
      y: centerY - centerHeight / 2
    },
    topRight: {
      x: centerX + centerWidth / 2,
      y: centerY - centerHeight / 2
    },
    bottomLeft: {
      x: centerX - centerWidth / 2,
      y: centerY + centerHeight / 2
    },
    bottomRight: {
      x: centerX + centerWidth / 2,
      y: centerY + centerHeight / 2
    }
  };
}

export const DEFAULT_SURFACE_CONFIG = {
  name: 'Surface',
  contentType: CONTENT_TYPES.CHECKERBOARD,
  visible: true,
  renderOrder: 0
};

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_MODE: ' ',
  TOGGLE_FULLSCREEN: 'f',
  ADD_SURFACE: 'a',
  DELETE_SURFACE: 'Delete'
};

export const STORAGE_KEYS = {
  SURFACES: 'projection_mapping_surfaces',
  APP_STATE: 'projection_mapping_app_state'
};

export const GRID_SIZE = 8; // 8x8 grid for checkerboard and grid patterns
export const GEOMETRY_SUBDIVISIONS = 20; // PlaneGeometry subdivisions
