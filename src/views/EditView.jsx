import React from 'react';
import { Scene } from '../features/scene';
import { SurfacePanel, StatusBar, Notification } from '../features/ui';
import { CalibrationMode } from '../features/calibration';
import { useApp } from '../shared/context/AppContext';
import { useSurfaces } from '../features/surface-manager';
import { useKeyboard } from '../shared/hooks/useKeyboard';
import { KEYBOARD_SHORTCUTS } from '../shared/utils/constants';
import './EditView.css';

/**
 * Edit View Component
 * Full editor interface with controls, preview, and calibration
 */
export function EditView() {
  const { toggleMode, toggleFullscreen } = useApp();
  const { addSurface } = useSurfaces();

  // Set up keyboard shortcuts
  useKeyboard({
    [KEYBOARD_SHORTCUTS.TOGGLE_MODE]: toggleMode,
    [KEYBOARD_SHORTCUTS.TOGGLE_FULLSCREEN]: toggleFullscreen,
    [KEYBOARD_SHORTCUTS.ADD_SURFACE]: addSurface
  });

  return (
    <div className="edit-view">
      {/* 3D Scene Preview */}
      <div className="canvas-container">
        <Scene />
      </div>

      {/* UI Overlays */}
      <SurfacePanel />
      <StatusBar />
      <CalibrationMode />
      <Notification />
    </div>
  );
}
