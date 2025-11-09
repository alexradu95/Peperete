import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AppProvider, useApp } from './AppContext';
import { broadcastManager, MessageTypes } from '../utils/broadcast-channel';
import { APP_MODES } from '../utils/constants';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe('AppContext', () => {
  let broadcastSpy: ReturnType<typeof vi.spyOn>;
  let subscribeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    broadcastSpy = vi.spyOn(broadcastManager, 'broadcast');
    subscribeSpy = vi.spyOn(broadcastManager, 'subscribe');
  });

  afterEach(() => {
    broadcastSpy.mockRestore();
    subscribeSpy.mockRestore();
    vi.clearAllTimers();
  });

  describe('provider and hook', () => {
    it('should throw error when useApp used outside provider', () => {
      expect(() => {
        renderHook(() => useApp());
      }).toThrow('useApp must be used within AppProvider');
    });

    it('should provide context when used within provider', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.mode).toBeDefined();
      expect(result.current.setMode).toBeDefined();
      expect(result.current.toggleMode).toBeDefined();
    });
  });

  describe('initial state', () => {
    it('should initialize with calibration mode', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      expect(result.current.mode).toBe(APP_MODES.CALIBRATION);
    });

    it('should initialize with fullscreen disabled', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      expect(result.current.isFullscreen).toBe(false);
    });

    it('should initialize with no notification', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      expect(result.current.notification).toBeNull();
    });

    it('should initialize with sidebar visible', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      expect(result.current.isSidebarVisible).toBe(true);
    });
  });

  describe('mode management', () => {
    it('should update mode when setMode is called', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.setMode(APP_MODES.PLAYBACK);
      });

      expect(result.current.mode).toBe(APP_MODES.PLAYBACK);
    });

    it('should broadcast mode change when setMode is called', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.setMode(APP_MODES.PLAYBACK);
      });

      expect(broadcastSpy).toHaveBeenCalledWith(
        MessageTypes.MODE_CHANGED,
        { mode: APP_MODES.PLAYBACK }
      );
    });

    it('should support function updater for setMode', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.setMode(() => APP_MODES.PLAYBACK);
      });

      expect(result.current.mode).toBe(APP_MODES.PLAYBACK);
    });

    it('should toggle between calibration and playback modes', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      expect(result.current.mode).toBe(APP_MODES.CALIBRATION);

      act(() => {
        result.current.toggleMode();
      });

      expect(result.current.mode).toBe(APP_MODES.PLAYBACK);

      act(() => {
        result.current.toggleMode();
      });

      expect(result.current.mode).toBe(APP_MODES.CALIBRATION);
    });

    it('should broadcast when toggling mode', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      broadcastSpy.mockClear();

      act(() => {
        result.current.toggleMode();
      });

      expect(broadcastSpy).toHaveBeenCalledWith(
        MessageTypes.MODE_CHANGED,
        { mode: APP_MODES.PLAYBACK }
      );
    });
  });

  describe('fullscreen management', () => {
    let requestFullscreenMock: ReturnType<typeof vi.fn>;
    let exitFullscreenMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      requestFullscreenMock = vi.fn().mockResolvedValue(undefined);
      exitFullscreenMock = vi.fn().mockResolvedValue(undefined);

      Object.defineProperty(document.documentElement, 'requestFullscreen', {
        configurable: true,
        value: requestFullscreenMock
      });

      Object.defineProperty(document, 'exitFullscreen', {
        configurable: true,
        value: exitFullscreenMock
      });

      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: null,
        writable: true
      });
    });

    it('should request fullscreen when not in fullscreen', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.toggleFullscreen();
      });

      expect(requestFullscreenMock).toHaveBeenCalled();
      expect(result.current.isFullscreen).toBe(true);
    });

    it('should exit fullscreen when already in fullscreen', () => {
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: document.documentElement,
        writable: true
      });

      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.toggleFullscreen();
      });

      expect(exitFullscreenMock).toHaveBeenCalled();
      expect(result.current.isFullscreen).toBe(false);
    });
  });

  describe('notification management', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should show notification with message', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.showNotification('Test message');
      });

      expect(result.current.notification).toBe('Test message');
    });

    it('should clear notification after default duration', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.showNotification('Test message');
      });

      expect(result.current.notification).toBe('Test message');

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.notification).toBeNull();
    });

    it('should clear notification after custom duration', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.showNotification('Test message', 1000);
      });

      expect(result.current.notification).toBe('Test message');

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.notification).toBeNull();
    });

    it('should replace existing notification with new one', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.showNotification('First message');
      });

      expect(result.current.notification).toBe('First message');

      act(() => {
        result.current.showNotification('Second message');
      });

      expect(result.current.notification).toBe('Second message');
    });
  });

  describe('sidebar management', () => {
    it('should toggle sidebar visibility', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      expect(result.current.isSidebarVisible).toBe(true);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.isSidebarVisible).toBe(false);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.isSidebarVisible).toBe(true);
    });
  });

  describe('broadcast channel integration', () => {
    it('should subscribe to mode changes on mount', () => {
      renderHook(() => useApp(), { wrapper });

      expect(subscribeSpy).toHaveBeenCalledWith(
        MessageTypes.MODE_CHANGED,
        expect.any(Function)
      );
    });

    it('should update mode when receiving broadcast from other tabs', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      expect(result.current.mode).toBe(APP_MODES.CALIBRATION);

      const subscribeCallback = subscribeSpy.mock.calls[0]?.[1];
      expect(subscribeCallback).toBeDefined();

      act(() => {
        subscribeCallback?.({ mode: APP_MODES.PLAYBACK });
      });

      expect(result.current.mode).toBe(APP_MODES.PLAYBACK);
    });

    it('should unsubscribe from broadcasts on unmount', () => {
      const unsubscribeMock = vi.fn();
      subscribeSpy.mockReturnValue(unsubscribeMock);

      const { unmount } = renderHook(() => useApp(), { wrapper });

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('should not broadcast when mode updated from other tab', () => {
      renderHook(() => useApp(), { wrapper });

      broadcastSpy.mockClear();

      const subscribeCallback = subscribeSpy.mock.calls[0]?.[1];

      act(() => {
        subscribeCallback?.({ mode: APP_MODES.PLAYBACK });
      });

      expect(broadcastSpy).not.toHaveBeenCalled();
    });
  });

  describe('context value structure', () => {
    it('should provide all expected properties and methods', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      expect(result.current).toHaveProperty('mode');
      expect(result.current).toHaveProperty('setMode');
      expect(result.current).toHaveProperty('toggleMode');
      expect(result.current).toHaveProperty('isFullscreen');
      expect(result.current).toHaveProperty('toggleFullscreen');
      expect(result.current).toHaveProperty('notification');
      expect(result.current).toHaveProperty('showNotification');
      expect(result.current).toHaveProperty('isSidebarVisible');
      expect(result.current).toHaveProperty('toggleSidebar');
    });

    it('should have stable function references', () => {
      const { result, rerender } = renderHook(() => useApp(), { wrapper });

      const initialSetMode = result.current.setMode;
      const initialToggleMode = result.current.toggleMode;
      const initialToggleFullscreen = result.current.toggleFullscreen;
      const initialShowNotification = result.current.showNotification;
      const initialToggleSidebar = result.current.toggleSidebar;

      rerender();

      expect(result.current.setMode).toBe(initialSetMode);
      expect(result.current.toggleMode).toBe(initialToggleMode);
      expect(result.current.toggleFullscreen).toBe(initialToggleFullscreen);
      expect(result.current.showNotification).toBe(initialShowNotification);
      expect(result.current.toggleSidebar).toBe(initialToggleSidebar);
    });
  });
});
