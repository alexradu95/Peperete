import React from 'react';
import { CornerPoint } from './CornerPoint';
import { TRANSFORM_MODES, calculateSurfaceCenter } from '../utils/SurfaceTransformations';
import { GeometryGenerator } from '../../../core/geometry/GeometryGenerator';

/**
 * CalibrationControls Component
 *
 * Renders the interactive calibration controls based on transform mode:
 * - Corner points for CORNERS mode
 * - Drag area with center indicator for MOVE/ROTATE/SCALE modes
 */
export function CalibrationControls({
  surface,
  transformMode,
  handleCornerDrag,
  bindSurfaceDrag
}) {
  if (!surface) return null;

  // Get corner keys for rendering
  const cornerKeys = GeometryGenerator.getCornerKeys(surface.geometryType, surface.cornerCount);

  // Calculate surface center for visual feedback
  const surfaceCenter = calculateSurfaceCenter(surface.corners);

  return (
    <>
      {/* Corner Points - only show in CORNERS mode */}
      {transformMode === TRANSFORM_MODES.CORNERS &&
        cornerKeys.map((cornerKey, index) => {
          const label = getCornerShortLabel(cornerKey, index);
          return (
            <CornerPoint
              key={cornerKey}
              corner={cornerKey}
              position={surface.corners[cornerKey]}
              onDrag={handleCornerDrag}
              label={label}
            />
          );
        })}

      {/* Whole-surface drag area for MOVE/ROTATE/SCALE modes */}
      {transformMode !== TRANSFORM_MODES.CORNERS && (
        <div
          {...bindSurfaceDrag()}
          className={`surface-transform-area ${transformMode}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor:
              transformMode === TRANSFORM_MODES.MOVE
                ? 'move'
                : transformMode === TRANSFORM_MODES.ROTATE
                ? 'grab'
                : 'nwse-resize',
            touchAction: 'none',
          }}
        >
          {/* Center indicator for rotate/scale modes */}
          {surfaceCenter && (transformMode === TRANSFORM_MODES.ROTATE || transformMode === TRANSFORM_MODES.SCALE) && (
            <div
              className="surface-center-indicator"
              style={{
                position: 'absolute',
                left: surfaceCenter.x,
                top: surfaceCenter.y,
                width: '20px',
                height: '20px',
                marginLeft: '-10px',
                marginTop: '-10px',
                borderRadius: '50%',
                border: '2px solid rgba(74, 144, 226, 0.8)',
                backgroundColor: 'rgba(74, 144, 226, 0.3)',
                pointerEvents: 'none',
                zIndex: 1000,
              }}
            />
          )}
        </div>
      )}
    </>
  );
}

/**
 * Helper function to get short corner label for visual display
 */
function getCornerShortLabel(cornerKey, index) {
  if (cornerKey === 'topLeft') return 'TL';
  if (cornerKey === 'topRight') return 'TR';
  if (cornerKey === 'bottomLeft') return 'BL';
  if (cornerKey === 'bottomRight') return 'BR';
  return `${index + 1}`;
}
