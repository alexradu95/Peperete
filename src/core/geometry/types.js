/**
 * Geometry System Type Definitions
 */

/**
 * Geometry types
 */
export const GEOMETRY_TYPES = {
  POLYGON: 'polygon'
};

/**
 * Default geometry configuration
 */
export const DEFAULT_GEOMETRY_CONFIG = {
  type: GEOMETRY_TYPES.POLYGON,
  cornerCount: 4,
  subdivisions: 20
};

/**
 * Corner count constraints
 */
export const CORNER_COUNT = {
  MIN: 3,
  MAX: 8,
  DEFAULT: 4
};
