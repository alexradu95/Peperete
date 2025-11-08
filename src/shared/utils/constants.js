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

export const DEFAULT_SURFACE_CONFIG = {
  name: 'Surface',
  corners: {
    topLeft: { x: 0.25, y: 0.75 },
    topRight: { x: 0.75, y: 0.75 },
    bottomLeft: { x: 0.25, y: 0.25 },
    bottomRight: { x: 0.75, y: 0.25 }
  },
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
