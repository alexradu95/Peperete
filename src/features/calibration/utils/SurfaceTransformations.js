/**
 * Utility functions for transforming entire surfaces (move, rotate, scale)
 */

export const TRANSFORM_MODES = {
  CORNERS: 'corners',
  MOVE: 'move',
  ROTATE: 'rotate',
  SCALE: 'scale',
};

/**
 * Calculate the center point of a surface from its corners
 * @param {Object} corners - Object with point0, point1, etc. each having {x, y}
 * @returns {{x: number, y: number}} - Center point
 */
export function calculateSurfaceCenter(corners) {
  const cornerKeys = Object.keys(corners).sort();
  const numCorners = cornerKeys.length;

  if (numCorners === 0) {
    return { x: 0, y: 0 };
  }

  const sum = cornerKeys.reduce(
    (acc, key) => ({
      x: acc.x + corners[key].x,
      y: acc.y + corners[key].y,
    }),
    { x: 0, y: 0 }
  );

  return {
    x: sum.x / numCorners,
    y: sum.y / numCorners,
  };
}

/**
 * Move all corners by a given offset
 * @param {Object} corners - Current corners
 * @param {number} dx - X offset
 * @param {number} dy - Y offset
 * @returns {Object} - New corners object
 */
export function moveSurface(corners, dx, dy) {
  const newCorners = {};
  Object.keys(corners).forEach((key) => {
    newCorners[key] = {
      x: corners[key].x + dx,
      y: corners[key].y + dy,
    };
  });
  return newCorners;
}

/**
 * Rotate all corners around the surface center
 * @param {Object} corners - Current corners
 * @param {number} angleRadians - Rotation angle in radians
 * @param {{x: number, y: number}} [pivot] - Optional pivot point (defaults to surface center)
 * @returns {Object} - New corners object
 */
export function rotateSurface(corners, angleRadians, pivot = null) {
  const center = pivot || calculateSurfaceCenter(corners);
  const cos = Math.cos(angleRadians);
  const sin = Math.sin(angleRadians);

  const newCorners = {};
  Object.keys(corners).forEach((key) => {
    const corner = corners[key];

    // Translate to origin
    const x = corner.x - center.x;
    const y = corner.y - center.y;

    // Rotate
    const rotatedX = x * cos - y * sin;
    const rotatedY = x * sin + y * cos;

    // Translate back
    newCorners[key] = {
      x: rotatedX + center.x,
      y: rotatedY + center.y,
    };
  });

  return newCorners;
}

/**
 * Scale all corners from the surface center
 * @param {Object} corners - Current corners
 * @param {number} scaleX - X scale factor
 * @param {number} scaleY - Y scale factor (optional, defaults to scaleX for uniform scaling)
 * @param {{x: number, y: number}} [pivot] - Optional pivot point (defaults to surface center)
 * @returns {Object} - New corners object
 */
export function scaleSurface(corners, scaleX, scaleY = scaleX, pivot = null) {
  const center = pivot || calculateSurfaceCenter(corners);

  const newCorners = {};
  Object.keys(corners).forEach((key) => {
    const corner = corners[key];

    // Translate to origin
    const x = corner.x - center.x;
    const y = corner.y - center.y;

    // Scale
    const scaledX = x * scaleX;
    const scaledY = y * scaleY;

    // Translate back
    newCorners[key] = {
      x: scaledX + center.x,
      y: scaledY + center.y,
    };
  });

  return newCorners;
}

/**
 * Get the bounding box of a surface
 * @param {Object} corners - Surface corners
 * @returns {{minX: number, maxX: number, minY: number, maxY: number, width: number, height: number}}
 */
export function getSurfaceBounds(corners) {
  const cornerKeys = Object.keys(corners);

  if (cornerKeys.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  cornerKeys.forEach((key) => {
    const corner = corners[key];
    minX = Math.min(minX, corner.x);
    maxX = Math.max(maxX, corner.x);
    minY = Math.min(minY, corner.y);
    maxY = Math.max(maxY, corner.y);
  });

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Check if a point is inside the surface polygon
 * @param {{x: number, y: number}} point - Point to test
 * @param {Object} corners - Surface corners
 * @returns {boolean} - True if point is inside the polygon
 */
export function isPointInsideSurface(point, corners) {
  const cornerKeys = Object.keys(corners).sort();
  const vertices = cornerKeys.map((key) => corners[key]);

  // Ray casting algorithm
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x;
    const yi = vertices[i].y;
    const xj = vertices[j].x;
    const yj = vertices[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}
