import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AppMode } from '../schemas';
import { APP_MODES } from '../utils/constants';
import { broadcastManager, MessageTypes } from '../utils/broadcast-channel';

export type AppContextValue = {
  mode: AppMode;
  setMode: (mode: AppMode | ((prevMode: AppMode) => AppMode)) => void;
  toggleMode: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  notification: string | null;
  showNotification: (message: string, duration?: number) => void;
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
};

type AppProviderProps = {
  children: React.ReactNode;
};

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: AppProviderProps) => {
  const [mode, setModeInternal] = useState<AppMode>(APP_MODES.CALIBRATION);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const setMode = useCallback((newMode: AppMode | ((prevMode: AppMode) => AppMode)) => {
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

  const showNotification = useCallback((message: string, duration: number = 3000) => {
    setNotification(message);
    setTimeout(() => setNotification(null), duration);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible(prev => !prev);
  }, []);

  useEffect(() => {
    const unsubscribeMode = broadcastManager.subscribe(
      MessageTypes.MODE_CHANGED,
      (payload: unknown) => {
        const data = payload as { mode: AppMode };
        setModeInternal(data.mode);
      }
    );

    return () => {
      unsubscribeMode();
    };
  }, []);

  const value: AppContextValue = {
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
};

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
