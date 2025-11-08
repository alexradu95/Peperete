import React, { useEffect, useRef } from 'react';
import { useSurfaces } from '../../surface-manager/context/SurfaceContext';
import { useApp } from '../../../shared/context/AppContext';
import { APP_MODES, GEOMETRY_TYPES } from '../../../shared/utils/constants';
import { CornerPoint } from './CornerPoint';
import { GeometryGenerator } from '../../scene/utils/GeometryGenerator';
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

    // Get corner keys based on geometry type
    const cornerKeys = GeometryGenerator.getCornerKeys(surface.geometryType, surface.cornerCount);

    // Create folders for each corner
    cornerKeys.forEach((cornerKey, index) => {
      const cornerLabel = getCornerLabel(cornerKey, index);
      const folder = gui.addFolder(cornerLabel);

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

  return (
    <div className="calibration-overlay">
      {/* Corner Points - dynamically rendered based on geometry type */}
      {cornerKeys.map((cornerKey, index) => {
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

// Helper function to get short corner label for visual display
function getCornerShortLabel(cornerKey, index) {
  if (cornerKey === 'topLeft') return 'TL';
  if (cornerKey === 'topRight') return 'TR';
  if (cornerKey === 'bottomLeft') return 'BL';
  if (cornerKey === 'bottomRight') return 'BR';
  return `${index + 1}`;
}
