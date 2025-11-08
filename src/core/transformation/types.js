/**
 * Transformation System Type Definitions
 */

/**
 * Transform modes for calibration
 */
export const TRANSFORM_MODES = {
  CORNERS: 'corners',
  MOVE: 'move',
  ROTATE: 'rotate',
  SCALE: 'scale'
};

/**
 * Default transform configuration
 */
export const DEFAULT_TRANSFORM_CONFIG = {
  mode: TRANSFORM_MODES.CORNERS,
  precision: 1 // pixel precision for snapping
};
