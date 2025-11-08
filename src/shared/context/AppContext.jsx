import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { APP_MODES } from '../utils/constants';
import { broadcastManager, MessageTypes } from '../utils/broadcastChannel';

/**
 * Global application state context
 * Manages app mode (calibration/playback) and fullscreen state
 * Syncs across tabs via BroadcastChannel
 */

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [mode, setModeInternal] = useState(APP_MODES.CALIBRATION);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Wrapper to broadcast mode changes
  const setMode = useCallback((newMode) => {
    const resolvedMode = typeof newMode === 'function' ? newMode(mode) : newMode;
    setModeInternal(resolvedMode);
    broadcastManager.broadcast(MessageTypes.MODE_CHANGED, { mode: resolvedMode });
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode(prev =>
      prev === APP_MODES.CALIBRATION ? APP_MODES.PLAYBACK : APP_MODES.CALIBRATION
    );
  }, [setMode]);

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

  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible(prev => !prev);
  }, []);

  // Listen for broadcasts from other tabs
  useEffect(() => {
    const unsubscribeMode = broadcastManager.subscribe(
      MessageTypes.MODE_CHANGED,
      ({ mode: newMode }) => {
        setModeInternal(newMode);
      }
    );

    return () => {
      unsubscribeMode();
    };
  }, []);

  const value = {
    mode,
    setMode,
    toggleMode,
    isFullscreen,
    toggleFullscreen,
    notification,
    showNotification,
    isSidebarVisible,
    toggleSidebar
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
