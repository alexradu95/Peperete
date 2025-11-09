import React from 'react';
import { Scene } from '../features/scene';
import { SurfacePanel, StatusBar, Notification } from '../features/ui';
import { SidebarToggle } from '../features/ui/components/SidebarToggle';
import { CalibrationMode } from '../features/calibration';
import { useApp } from '../shared/context/AppContext';
import { useSurfaces } from '../features/surface-manager';
import { useKeyboard } from '../shared/hooks/useKeyboard';
import { KEYBOARD_SHORTCUTS } from '../shared/utils/constants';

/**
 * Edit View Component
 * Full editor interface with controls, preview, and calibration
 */
export function EditView() {
  const { toggleMode, toggleFullscreen, toggleSidebar } = useApp();
  const { addSurface } = useSurfaces();

  // Set up keyboard shortcuts
  useKeyboard({
    [KEYBOARD_SHORTCUTS.TOGGLE_MODE]: toggleMode,
    [KEYBOARD_SHORTCUTS.TOGGLE_FULLSCREEN]: toggleFullscreen,
    [KEYBOARD_SHORTCUTS.ADD_SURFACE]: addSurface,
    [KEYBOARD_SHORTCUTS.TOGGLE_SIDEBAR]: toggleSidebar
  });

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      {/* 3D Scene Preview */}
      <div className="w-full h-full">
        <Scene />
      </div>

      {/* UI Overlays */}
      <SurfacePanel />
      <SidebarToggle />
      <StatusBar />
      <CalibrationMode />
      <Notification />
    </div>
  );
}
