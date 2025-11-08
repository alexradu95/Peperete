import React, { useEffect } from 'react';
import { AppProvider, useApp } from './shared/context/AppContext';
import { SurfaceProvider, useSurfaces } from './features/surface-manager';
import { Scene } from './features/scene';
import { SurfacePanel, StatusBar, Notification } from './features/ui';
import { CalibrationMode } from './features/calibration';
import { useKeyboard } from './shared/hooks/useKeyboard';
import { KEYBOARD_SHORTCUTS } from './shared/utils/constants';
import './App.css';

/**
 * Main Application Component (Inner)
 * Contains the application logic with access to contexts
 */
function AppInner() {
  const { toggleMode, toggleFullscreen } = useApp();
  const { addSurface } = useSurfaces();

  // Set up keyboard shortcuts
  useKeyboard({
    [KEYBOARD_SHORTCUTS.TOGGLE_MODE]: toggleMode,
    [KEYBOARD_SHORTCUTS.TOGGLE_FULLSCREEN]: toggleFullscreen,
    [KEYBOARD_SHORTCUTS.ADD_SURFACE]: addSurface
  });

  return (
    <div className="app">
      {/* 3D Scene */}
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

/**
 * Main Application Component (Outer)
 * Provides all contexts
 */
export default function App() {
  return (
    <AppProvider>
      <SurfaceProvider>
        <AppInner />
      </SurfaceProvider>
    </AppProvider>
  );
}
