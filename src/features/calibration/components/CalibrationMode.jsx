import React, { useEffect, useRef } from 'react';
import { useSurfaces } from '../../surface-manager/context/SurfaceContext';
import { useApp } from '../../../shared/context/AppContext';
import { APP_MODES } from '../../../shared/utils/constants';
import { CornerPoint } from './CornerPoint';
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

    // Top Left
    const tlFolder = gui.addFolder('Top Left');
    tlFolder.add(surface.corners.topLeft, 'x', 0, window.innerWidth).onChange((value) => {
      handleCornerDrag('topLeft', { ...surface.corners.topLeft, x: value });
    });
    tlFolder.add(surface.corners.topLeft, 'y', 0, window.innerHeight).onChange((value) => {
      handleCornerDrag('topLeft', { ...surface.corners.topLeft, y: value });
    });

    // Top Right
    const trFolder = gui.addFolder('Top Right');
    trFolder.add(surface.corners.topRight, 'x', 0, window.innerWidth).onChange((value) => {
      handleCornerDrag('topRight', { ...surface.corners.topRight, x: value });
    });
    trFolder.add(surface.corners.topRight, 'y', 0, window.innerHeight).onChange((value) => {
      handleCornerDrag('topRight', { ...surface.corners.topRight, y: value });
    });

    // Bottom Left
    const blFolder = gui.addFolder('Bottom Left');
    blFolder.add(surface.corners.bottomLeft, 'x', 0, window.innerWidth).onChange((value) => {
      handleCornerDrag('bottomLeft', { ...surface.corners.bottomLeft, x: value });
    });
    blFolder.add(surface.corners.bottomLeft, 'y', 0, window.innerHeight).onChange((value) => {
      handleCornerDrag('bottomLeft', { ...surface.corners.bottomLeft, y: value });
    });

    // Bottom Right
    const brFolder = gui.addFolder('Bottom Right');
    brFolder.add(surface.corners.bottomRight, 'x', 0, window.innerWidth).onChange((value) => {
      handleCornerDrag('bottomRight', { ...surface.corners.bottomRight, x: value });
    });
    brFolder.add(surface.corners.bottomRight, 'y', 0, window.innerHeight).onChange((value) => {
      handleCornerDrag('bottomRight', { ...surface.corners.bottomRight, y: value });
    });

    return () => {
      if (guiRef.current) {
        guiRef.current.destroy();
        guiRef.current = null;
      }
    };
  }, [mode, surface?.id, surface?.name]); // Recreate GUI when surface changes

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
      {/* Corner Points */}
      <CornerPoint
        corner="topLeft"
        position={surface.corners.topLeft}
        onDrag={handleCornerDrag}
        label="TL"
      />
      <CornerPoint
        corner="topRight"
        position={surface.corners.topRight}
        onDrag={handleCornerDrag}
        label="TR"
      />
      <CornerPoint
        corner="bottomLeft"
        position={surface.corners.bottomLeft}
        onDrag={handleCornerDrag}
        label="BL"
      />
      <CornerPoint
        corner="bottomRight"
        position={surface.corners.bottomRight}
        onDrag={handleCornerDrag}
        label="BR"
      />

      {/* lil-gui container */}
      <div ref={guiContainerRef} className="calibration-gui" />

      {/* Calibration Instructions */}
      <div className="calibration-instructions">
        <h3>Calibration Mode</h3>
        <p>Drag the corner points to align the surface with your projection area</p>
        <p className="hint">Press <kbd>Space</kbd> to switch to Playback mode</p>
      </div>
    </div>
  );
}
