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

export const GEOMETRY_TYPES = {
  RECTANGLE: 'rectangle',
  TRIANGLE: 'triangle',
  CIRCLE: 'circle',
  CUSTOM: 'custom'
};

/**
 * Get default corners based on current window size and geometry type
 * Places corners in the center with some margin
 */
export function getDefaultCorners(geometryType = GEOMETRY_TYPES.RECTANGLE, cornerCount = 4) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.25;

  switch (geometryType) {
    case GEOMETRY_TYPES.TRIANGLE:
      return {
        point0: { x: centerX, y: centerY - radius },
        point1: { x: centerX - radius * 0.866, y: centerY + radius * 0.5 },
        point2: { x: centerX + radius * 0.866, y: centerY + radius * 0.5 }
      };

    case GEOMETRY_TYPES.CIRCLE:
      // Circle uses control points around the perimeter
      const points = {};
      const numPoints = 8; // 8 control points for smooth circle
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2 - Math.PI / 2; // Start from top
        points[`point${i}`] = {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        };
      }
      return points;

    case GEOMETRY_TYPES.CUSTOM:
      // Custom geometry with specified number of corners (3-8)
      const customPoints = {};
      const numCustomPoints = Math.min(8, Math.max(3, cornerCount));
      for (let i = 0; i < numCustomPoints; i++) {
        const angle = (i / numCustomPoints) * Math.PI * 2 - Math.PI / 2;
        customPoints[`point${i}`] = {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        };
      }
      return customPoints;

    case GEOMETRY_TYPES.RECTANGLE:
    default:
      // Default rectangle with 4 corners
      const centerWidth = width * 0.5;
      const centerHeight = height * 0.5;
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
}

export const DEFAULT_SURFACE_CONFIG = {
  name: 'Surface',
  contentType: CONTENT_TYPES.CHECKERBOARD,
  geometryType: GEOMETRY_TYPES.RECTANGLE,
  cornerCount: 4,
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
