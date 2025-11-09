import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AudioProvider, useAudio, type AudioData, type AudioContextValue } from './AudioContext';

/**
 * Test suite for AudioContext
 * Covers provider, hook, audio initialization, frequency analysis, and cleanup
 */

describe('AudioContext', () => {
  // Mock Web Audio API
  let mockAudioContext: any;
  let mockAnalyser: any;
  let mockMicrophone: any;
  let mockStream: any;
  let mockGetUserMedia: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock AnalyserNode
    mockAnalyser = {
      fftSize: 0,
      smoothingTimeConstant: 0,
      frequencyBinCount: 128,
      getByteFrequencyData: vi.fn((array: Uint8Array) => {
        // Fill with mock frequency data
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 255);
        }
      })
    };

    // Mock MediaStreamAudioSourceNode
    mockMicrophone = {
      connect: vi.fn(),
      mediaStream: {
        getTracks: vi.fn(() => [
          { stop: vi.fn() },
          { stop: vi.fn() }
        ])
      }
    };

    // Mock AudioContext
    mockAudioContext = {
      createAnalyser: vi.fn(() => mockAnalyser),
      createMediaStreamSource: vi.fn(() => mockMicrophone),
      close: vi.fn().mockResolvedValue(undefined),
      state: 'running'
    };

    // Mock MediaStream
    mockStream = {
      getTracks: vi.fn(() => [{ stop: vi.fn() }])
    };

    // Mock getUserMedia
    mockGetUserMedia = vi.fn().mockResolvedValue(mockStream);

    // Setup global mocks with proper constructor
    (global as any).AudioContext = class {
      constructor() {
        return mockAudioContext;
      }
    };
    (global.navigator as any).mediaDevices = {
      getUserMedia: mockGetUserMedia
    };

    // Mock requestAnimationFrame / cancelAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => {
      setTimeout(cb, 16);
      return 1;
    }) as any;
    global.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AudioProvider', () => {
    it('should provide audio context to children', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.isAudioEnabled).toBe(false);
      expect(result.current.hasPermission).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should have default audio data', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      expect(result.current.audioData).toEqual({
        amplitude: 0,
        bass: 0,
        mid: 0,
        treble: 0,
        frequency: 0
      });
    });
  });

  describe('useAudio hook', () => {
    it('should throw error when used outside AudioProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAudio());
      }).toThrow('useAudio must be used within AudioProvider');

      consoleError.mockRestore();
    });

    it('should return audio context value', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      expect(result.current).toHaveProperty('isAudioEnabled');
      expect(result.current).toHaveProperty('hasPermission');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('audioData');
      expect(result.current).toHaveProperty('enableAudio');
      expect(result.current).toHaveProperty('disableAudio');
      expect(result.current).toHaveProperty('toggleAudio');
    });
  });

  describe('enableAudio', () => {
    it('should request microphone permission', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      await act(async () => {
        await result.current.enableAudio();
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
    });

    it('should create audio context and analyser', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      await act(async () => {
        await result.current.enableAudio();
      });

      // Verify methods were called on the audio context instance
      expect(mockAudioContext.createAnalyser).toHaveBeenCalled();
      expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledWith(mockStream);
    });

    it('should configure analyser with correct settings', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      await act(async () => {
        await result.current.enableAudio();
      });

      expect(mockAnalyser.fftSize).toBe(256);
      expect(mockAnalyser.smoothingTimeConstant).toBe(0.8);
    });

    it('should connect microphone to analyser', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      await act(async () => {
        await result.current.enableAudio();
      });

      expect(mockMicrophone.connect).toHaveBeenCalledWith(mockAnalyser);
    });

    it('should update state when audio is enabled', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      await act(async () => {
        await result.current.enableAudio();
      });

      expect(result.current.isAudioEnabled).toBe(true);
      expect(result.current.hasPermission).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should handle permission denied error', async () => {
      const mockError = new Error('Permission denied');
      mockGetUserMedia.mockRejectedValueOnce(mockError);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      await act(async () => {
        await result.current.enableAudio();
      });

      expect(result.current.isAudioEnabled).toBe(false);
      expect(result.current.hasPermission).toBe(false);
      expect(result.current.error).toBe('Permission denied');
    });

    it('should start audio analysis loop', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      await act(async () => {
        await result.current.enableAudio();
      });

      await waitFor(() => {
        expect(global.requestAnimationFrame).toHaveBeenCalled();
      });
    });
  });

  describe('disableAudio', () => {
    it('should cancel animation frame', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      await act(async () => {
        await result.current.enableAudio();
      });

      act(() => {
        result.current.disableAudio();
      });

      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('should stop microphone tracks', async () => {
      const mockTrack = { stop: vi.fn() };
      mockMicrophone.mediaStream.getTracks = vi.fn(() => [mockTrack]);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      await act(async () => {
        await result.current.enableAudio();
      });

      act(() => {
        result.current.disableAudio();
      });

      expect(mockTrack.stop).toHaveBeenCalled();
    });

    it('should close audio context', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      await act(async () => {
        await result.current.enableAudio();
      });

      await act(async () => {
        result.current.disableAudio();
      });

      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should reset audio data to defaults', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      await act(async () => {
        await result.current.enableAudio();
      });

      act(() => {
        result.current.disableAudio();
      });

      expect(result.current.audioData).toEqual({
        amplitude: 0,
        bass: 0,
        mid: 0,
        treble: 0,
        frequency: 0
      });
    });

    it('should update isAudioEnabled to false', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      await act(async () => {
        await result.current.enableAudio();
      });

      act(() => {
        result.current.disableAudio();
      });

      expect(result.current.isAudioEnabled).toBe(false);
    });
  });

  describe('toggleAudio', () => {
    it('should enable audio when disabled', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      expect(result.current.isAudioEnabled).toBe(false);

      await act(async () => {
        await result.current.toggleAudio();
      });

      expect(result.current.isAudioEnabled).toBe(true);
    });

    it('should disable audio when enabled', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      await act(async () => {
        await result.current.enableAudio();
      });

      expect(result.current.isAudioEnabled).toBe(true);

      act(() => {
        result.current.toggleAudio();
      });

      expect(result.current.isAudioEnabled).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should cleanup audio on unmount', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result, unmount } = renderHook(() => useAudio(), { wrapper });

      await act(async () => {
        await result.current.enableAudio();
      });

      unmount();

      expect(mockAudioContext.close).toHaveBeenCalled();
    });
  });

  describe('audio data types', () => {
    it('should have correct AudioData interface', () => {
      const audioData: AudioData = {
        amplitude: 0.5,
        bass: 0.3,
        mid: 0.7,
        treble: 0.9,
        frequency: 0.4
      };

      expect(audioData.amplitude).toBeTypeOf('number');
      expect(audioData.bass).toBeTypeOf('number');
      expect(audioData.mid).toBeTypeOf('number');
      expect(audioData.treble).toBeTypeOf('number');
      expect(audioData.frequency).toBeTypeOf('number');
    });

    it('should have correct AudioContextValue interface', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AudioProvider>{children}</AudioProvider>
      );

      const { result } = renderHook(() => useAudio(), { wrapper });

      const contextValue: AudioContextValue = result.current;

      expect(contextValue.isAudioEnabled).toBeTypeOf('boolean');
      expect(contextValue.hasPermission).toBeTypeOf('boolean');
      expect(contextValue.error).toSatisfy((v: any) => v === null || typeof v === 'string');
      expect(contextValue.audioData).toBeTypeOf('object');
      expect(contextValue.enableAudio).toBeTypeOf('function');
      expect(contextValue.disableAudio).toBeTypeOf('function');
      expect(contextValue.toggleAudio).toBeTypeOf('function');
    });
  });
});
