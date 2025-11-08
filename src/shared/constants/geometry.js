/**
 * Geometry-related constants
 */

/**
 * Geometry types
 */
export const GEOMETRY_TYPES = {
  POLYGON: 'polygon'
};

/**
 * Grid and subdivision settings
 */
export const GRID_SIZE = 8; // 8x8 grid for checkerboard and grid patterns
export const GEOMETRY_SUBDIVISIONS = 20; // Geometry subdivisions for smoothness

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

/**
 * Default surface configuration
 */
export const DEFAULT_SURFACE_CONFIG = {
  name: 'Surface',
  contentType: 'checkerboard', // Will map to CONTENT_TYPES.CHECKERBOARD
  geometryType: GEOMETRY_TYPES.POLYGON,
  cornerCount: 4,
  visible: true,
  renderOrder: 0,
  audioReactive: false
};
