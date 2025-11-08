import React, { useEffect, useRef, useState } from 'react';
import { useDrag } from '@use-gesture/react';
import { useSurfaces } from '../../surface-manager/context/SurfaceContext';
import { useApp } from '../../../shared/context/AppContext';
import { APP_MODES, GEOMETRY_TYPES } from '../../../shared/constants';
import { CornerPoint } from './CornerPoint';
import { TransformModeSelector } from './TransformModeSelector';
import { GeometryGenerator } from '../../../core/geometry/GeometryGenerator';
import {
  TRANSFORM_MODES,
  moveSurface,
  rotateSurface,
  scaleSurface,
  calculateSurfaceCenter,
  isPointInsideSurface,
} from '../utils/SurfaceTransformations';
import GUI from 'lil-gui';
import './CalibrationMode.css';

/**
 * Calibration Mode Component
 * Overlay with corner points and controls for calibrating surfaces
 */
export function CalibrationMode() {
  const { mode } = useApp();
  const { selectedSurfaceId, getSurface, updateSurfaceCorners } = useSurfaces();
  const guiRef = useRef(null);
  const guiContainerRef = useRef(null);
  const [transformMode, setTransformMode] = useState(TRANSFORM_MODES.CORNERS);
  const transformStateRef = useRef({ initialCenter: null, initialAngle: 0, initialDistance: 0 });

  const surface = selectedSurfaceId ? getSurface(selectedSurfaceId) : null;

  // Handle corner point drag
  const handleCornerDrag = (corner, position) => {
    if (!surface) return;

    const newCorners = {
      ...surface.corners,
      [corner]: position
    };

    updateSurfaceCorners(surface.id, newCorners);
  };

  // Handle whole-surface drag for move/rotate/scale
  const bindSurfaceDrag = useDrag(
    ({ offset: [x, y], first, last, movement: [mx, my], xy: [currentX, currentY] }) => {
      if (!surface) return;

      if (transformMode === TRANSFORM_MODES.MOVE) {
        // Move mode: translate surface
        if (first) {
          transformStateRef.current.initialCorners = { ...surface.corners };
        }
        const [dx, dy] = [x, y];
        const newCorners = moveSurface(transformStateRef.current.initialCorners, dx, dy);
        updateSurfaceCorners(surface.id, newCorners);
      } else if (transformMode === TRANSFORM_MODES.ROTATE) {
        // Rotate mode: rotate around center
        if (first) {
          transformStateRef.current.initialCorners = { ...surface.corners };
          const center = calculateSurfaceCenter(surface.corners);
          transformStateRef.current.initialCenter = center;
          transformStateRef.current.initialAngle = Math.atan2(
            currentY - center.y,
            currentX - center.x
          );
        }

        const center = transformStateRef.current.initialCenter;
        const currentAngle = Math.atan2(currentY - center.y, currentX - center.x);
        const deltaAngle = currentAngle - transformStateRef.current.initialAngle;

        const newCorners = rotateSurface(
          transformStateRef.current.initialCorners,
          deltaAngle,
          center
        );
        updateSurfaceCorners(surface.id, newCorners);
      } else if (transformMode === TRANSFORM_MODES.SCALE) {
        // Scale mode: scale from center
        if (first) {
          transformStateRef.current.initialCorners = { ...surface.corners };
          const center = calculateSurfaceCenter(surface.corners);
          transformStateRef.current.initialCenter = center;
          transformStateRef.current.initialDistance = Math.sqrt(
            Math.pow(currentX - center.x, 2) + Math.pow(currentY - center.y, 2)
          );
        }

        const center = transformStateRef.current.initialCenter;
        const currentDistance = Math.sqrt(
          Math.pow(currentX - center.x, 2) + Math.pow(currentY - center.y, 2)
        );

        const scaleFactor =
          transformStateRef.current.initialDistance > 0
            ? currentDistance / transformStateRef.current.initialDistance
            : 1;

        const newCorners = scaleSurface(
          transformStateRef.current.initialCorners,
          scaleFactor,
          scaleFactor,
          center
        );
        updateSurfaceCorners(surface.id, newCorners);
      }
    },
    {
      from: () => [0, 0],
    }
  );

  // Set up lil-gui controls
  useEffect(() => {
    if (mode !== APP_MODES.CALIBRATION || !surface || !guiContainerRef.current) {
      // Clean up GUI if it exists
      if (guiRef.current) {
        guiRef.current.destroy();
        guiRef.current = null;
      }
      return;
    }

    // Clean up existing GUI
    if (guiRef.current) {
      guiRef.current.destroy();
    }

    // Create new GUI
    const gui = new GUI({ container: guiContainerRef.current, width: 280 });
    guiRef.current = gui;

    gui.title(surface.name);

    // Add transformation controls
    const transformFolder = gui.addFolder('Transform');

    // Move controls
    const moveParams = {
      moveX: 0,
      moveY: 0,
      applyMove: () => {
        const newCorners = moveSurface(surface.corners, moveParams.moveX, moveParams.moveY);
        updateSurfaceCorners(surface.id, newCorners);
        moveParams.moveX = 0;
        moveParams.moveY = 0;
        gui.updateDisplay();
      },
    };

    const moveFolder = transformFolder.addFolder('Move');
    moveFolder.add(moveParams, 'moveX', -100, 100, 1).name('X Offset');
    moveFolder.add(moveParams, 'moveY', -100, 100, 1).name('Y Offset');
    moveFolder.add(moveParams, 'applyMove').name('Apply Move');

    // Rotate controls
    const rotateParams = {
      angle: 0,
      applyRotate: () => {
        const angleRadians = (rotateParams.angle * Math.PI) / 180;
        const newCorners = rotateSurface(surface.corners, angleRadians);
        updateSurfaceCorners(surface.id, newCorners);
        rotateParams.angle = 0;
        gui.updateDisplay();
      },
    };

    const rotateFolder = transformFolder.addFolder('Rotate');
    rotateFolder.add(rotateParams, 'angle', -180, 180, 1).name('Angle (degrees)');
    rotateFolder.add(rotateParams, 'applyRotate').name('Apply Rotation');

    // Scale controls
    const scaleParams = {
      scaleX: 1,
      scaleY: 1,
      uniform: true,
      applyScale: () => {
        const newCorners = scaleSurface(
          surface.corners,
          scaleParams.scaleX,
          scaleParams.uniform ? scaleParams.scaleX : scaleParams.scaleY
        );
        updateSurfaceCorners(surface.id, newCorners);
        scaleParams.scaleX = 1;
        scaleParams.scaleY = 1;
        gui.updateDisplay();
      },
    };

    const scaleFolder = transformFolder.addFolder('Scale');
    scaleFolder.add(scaleParams, 'uniform').name('Uniform Scale');
    scaleFolder.add(scaleParams, 'scaleX', 0.1, 3, 0.01).name('Scale X');
    scaleFolder.add(scaleParams, 'scaleY', 0.1, 3, 0.01).name('Scale Y');
    scaleFolder.add(scaleParams, 'applyScale').name('Apply Scale');

    // Get corner keys based on geometry type
    const cornerKeys = GeometryGenerator.getCornerKeys(surface.geometryType, surface.cornerCount);

    // Create folders for each corner
    const cornersFolder = gui.addFolder('Corners');
    cornerKeys.forEach((cornerKey, index) => {
      const cornerLabel = getCornerLabel(cornerKey, index);
      const folder = cornersFolder.addFolder(cornerLabel);

      folder.add(surface.corners[cornerKey], 'x', 0, window.innerWidth).onChange((value) => {
        handleCornerDrag(cornerKey, { ...surface.corners[cornerKey], x: value });
      });

      folder.add(surface.corners[cornerKey], 'y', 0, window.innerHeight).onChange((value) => {
        handleCornerDrag(cornerKey, { ...surface.corners[cornerKey], y: value });
      });
    });

    return () => {
      if (guiRef.current) {
        guiRef.current.destroy();
        guiRef.current = null;
      }
    };
  }, [mode, surface?.id, surface?.name, surface?.geometryType]); // Recreate GUI when surface changes

  // Helper function to get corner label
  const getCornerLabel = (cornerKey, index) => {
    if (cornerKey === 'topLeft') return 'Top Left';
    if (cornerKey === 'topRight') return 'Top Right';
    if (cornerKey === 'bottomLeft') return 'Bottom Left';
    if (cornerKey === 'bottomRight') return 'Bottom Right';
    return `Point ${index + 1}`;
  };

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

  // Get corner keys for rendering
  const cornerKeys = GeometryGenerator.getCornerKeys(surface.geometryType, surface.cornerCount);

  // Calculate surface center for visual feedback
  const surfaceCenter = surface ? calculateSurfaceCenter(surface.corners) : null;

  return (
    <div className="calibration-overlay">
      {/* Transformation Mode Selector */}
      <TransformModeSelector mode={transformMode} onModeChange={setTransformMode} />

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

      {/* lil-gui container */}
      <div ref={guiContainerRef} className="calibration-gui" />

      {/* Calibration Instructions */}
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
    </div>
  );
}

// Helper function to get short corner label for visual display
function getCornerShortLabel(cornerKey, index) {
  if (cornerKey === 'topLeft') return 'TL';
  if (cornerKey === 'topRight') return 'TR';
  if (cornerKey === 'bottomLeft') return 'BL';
  if (cornerKey === 'bottomRight') return 'BR';
  return `${index + 1}`;
}
