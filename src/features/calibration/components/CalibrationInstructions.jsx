import React from 'react';
import { TRANSFORM_MODES } from '../utils/SurfaceTransformations';

/**
 * CalibrationInstructions Component
 *
 * Displays instructions for the current calibration mode
 */
export function CalibrationInstructions({ transformMode }) {
  return (
    <div className="calibration-instructions">
      <h3>Calibration Mode</h3>
      {transformMode === TRANSFORM_MODES.CORNERS && (
        <p>Drag the corner points to align the surface with your projection area</p>
      )}
      {transformMode === TRANSFORM_MODES.MOVE && (
        <p>Click and drag anywhere to move the entire surface</p>
      )}
      {transformMode === TRANSFORM_MODES.ROTATE && (
        <p>Click and drag to rotate the surface around its center</p>
      )}
      {transformMode === TRANSFORM_MODES.SCALE && (
        <p>Drag away from or toward the center to scale the surface</p>
      )}
      <p className="hint">Press <kbd>Space</kbd> to switch to Playback mode</p>
    </div>
  );
}
