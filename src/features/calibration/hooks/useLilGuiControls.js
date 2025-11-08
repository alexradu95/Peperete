import { useEffect, useRef } from 'react';
import GUI from 'lil-gui';
import { APP_MODES } from '../../../shared/constants';
import { GeometryGenerator } from '../../../core/geometry/GeometryGenerator';
import {
  moveSurface,
  rotateSurface,
  scaleSurface,
} from '../utils/SurfaceTransformations';

/**
 * useLilGuiControls Hook
 *
 * Manages lil-gui control panel for surface calibration
 * Creates folders for Move, Rotate, Scale, and Corner controls
 */
export function useLilGuiControls(
  mode,
  surface,
  updateSurfaceCorners,
  handleCornerDrag,
  containerRef
) {
  const guiRef = useRef(null);

  useEffect(() => {
    if (mode !== APP_MODES.CALIBRATION || !surface || !containerRef.current) {
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
    const gui = new GUI({ container: containerRef.current, width: 280 });
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

  return guiRef;
}

/**
 * Helper function to get corner label
 */
function getCornerLabel(cornerKey, index) {
  if (cornerKey === 'topLeft') return 'Top Left';
  if (cornerKey === 'topRight') return 'Top Right';
  if (cornerKey === 'bottomLeft') return 'Bottom Left';
  if (cornerKey === 'bottomRight') return 'Bottom Right';
  return `Point ${index + 1}`;
}
