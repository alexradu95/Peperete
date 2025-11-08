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
  PLASMA: 'plasma',
  WAVES: 'waves',
  NOISE: 'noise',
  FIRE: 'fire',
  RAINBOW: 'rainbow',
  KALEIDOSCOPE: 'kaleidoscope',
  GLITCH: 'glitch',
  SPIRAL: 'spiral',
  WHITE: 'white',
  RED: 'red',
  GREEN: 'green',
  BLUE: 'blue',
  IMAGE: 'image'
};

export const GEOMETRY_TYPES = {
  POLYGON: 'polygon'
};

/**
 * Get default corners based on current window size and geometry type
 * Places corners in the center with some margin
 */
export function getDefaultCorners(geometryType = GEOMETRY_TYPES.POLYGON, cornerCount = 4) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.25;

  // Clamp corner count between 3 and 8
  const numCorners = Math.min(8, Math.max(3, cornerCount));

  const points = {};
  for (let i = 0; i < numCorners; i++) {
    const angle = (i / numCorners) * Math.PI * 2 - Math.PI / 2; // Start from top
    points[`point${i}`] = {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  }
  return points;
}

export const DEFAULT_SURFACE_CONFIG = {
  name: 'Surface',
  contentType: CONTENT_TYPES.CHECKERBOARD,
  geometryType: GEOMETRY_TYPES.POLYGON,
  cornerCount: 4,
  visible: true,
  renderOrder: 0
};

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_MODE: ' ',
  TOGGLE_FULLSCREEN: 'f',
  ADD_SURFACE: 'a',
  DELETE_SURFACE: 'Delete',
  TOGGLE_SIDEBAR: 's'
};

export const STORAGE_KEYS = {
  SURFACES: 'projection_mapping_surfaces',
  APP_STATE: 'projection_mapping_app_state'
};

export const GRID_SIZE = 8; // 8x8 grid for checkerboard and grid patterns
export const GEOMETRY_SUBDIVISIONS = 20; // PlaneGeometry subdivisions
