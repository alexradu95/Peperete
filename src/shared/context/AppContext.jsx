import React, { createContext, useContext, useState, useCallback } from 'react';
import { APP_MODES } from '../utils/constants';

/**
 * Global application state context
 * Manages app mode (calibration/playback) and fullscreen state
 */

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [mode, setMode] = useState(APP_MODES.CALIBRATION);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notification, setNotification] = useState(null);

  const toggleMode = useCallback(() => {
    setMode(prev =>
      prev === APP_MODES.CALIBRATION ? APP_MODES.PLAYBACK : APP_MODES.CALIBRATION
    );
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const showNotification = useCallback((message, duration = 3000) => {
    setNotification(message);
    setTimeout(() => setNotification(null), duration);
  }, []);

  const value = {
    mode,
    setMode,
    toggleMode,
    isFullscreen,
    toggleFullscreen,
    notification,
    showNotification
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
