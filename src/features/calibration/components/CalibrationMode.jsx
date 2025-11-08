import React, { useRef, useState } from 'react';
import { useSurfaces } from '../../surface-manager/context/SurfaceContext';
import { useApp } from '../../../shared/context/AppContext';
import { APP_MODES } from '../../../shared/constants';
import { TransformModeSelector } from './TransformModeSelector';
import { CalibrationControls } from './CalibrationControls';
import { CalibrationInstructions } from './CalibrationInstructions';
import { TRANSFORM_MODES } from '../utils/SurfaceTransformations';
import {
  useCornerDragging,
  useWholeTransform,
  useLilGuiControls
} from '../hooks';
import './CalibrationMode.css';

/**
 * Calibration Mode Component
 * Overlay with corner points and controls for calibrating surfaces
 *
 * REFACTORED: Reduced from 352 lines to ~90 lines
 * Extracted hooks: useCornerDragging, useWholeTransform, useLilGuiControls
 * Extracted components: CalibrationControls, CalibrationInstructions
 */
export function CalibrationMode() {
  const { mode } = useApp();
  const { selectedSurfaceId, getSurface, updateSurfaceCorners } = useSurfaces();
  const guiContainerRef = useRef(null);
  const [transformMode, setTransformMode] = useState(TRANSFORM_MODES.CORNERS);

  const surface = selectedSurfaceId ? getSurface(selectedSurfaceId) : null;

  // Use custom hooks for calibration logic
  const { handleCornerDrag } = useCornerDragging(surface, updateSurfaceCorners);
  const { bindSurfaceDrag } = useWholeTransform(surface, transformMode, updateSurfaceCorners);
  useLilGuiControls(mode, surface, updateSurfaceCorners, handleCornerDrag, guiContainerRef);

  // Don't render if not in calibration mode
  if (mode !== APP_MODES.CALIBRATION) {
    return null;
  }

  // Show message if no surface is selected
  if (!surface) {
    return (
      <div className="calibration-overlay">
        <div className="calibration-message">
          <h2>No Surface Selected</h2>
          <p>Select a surface from the left panel to begin calibration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calibration-overlay">
      {/* Transformation Mode Selector */}
      <TransformModeSelector mode={transformMode} onModeChange={setTransformMode} />

      {/* Calibration Controls (corner points or transform area) */}
      <CalibrationControls
        surface={surface}
        transformMode={transformMode}
        handleCornerDrag={handleCornerDrag}
        bindSurfaceDrag={bindSurfaceDrag}
      />

      {/* lil-gui container */}
      <div ref={guiContainerRef} className="calibration-gui" />

      {/* Calibration Instructions */}
      <CalibrationInstructions transformMode={transformMode} />
    </div>
  );
}
