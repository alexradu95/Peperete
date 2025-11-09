import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

/**
 * Audio data interface
 * Real-time frequency analysis data from microphone input
 */
export interface AudioData {
  /** Overall amplitude (0-1) */
  amplitude: number;
  /** Bass frequency intensity (0-1) */
  bass: number;
  /** Mid frequency intensity (0-1) */
  mid: number;
  /** Treble frequency intensity (0-1) */
  treble: number;
  /** Normalized dominant frequency (0-1) */
  frequency: number;
}

/**
 * Audio context value interface
 * Provides audio analysis state and control methods
 */
export interface AudioContextValue {
  /** Whether audio analysis is currently active */
  isAudioEnabled: boolean;
  /** Whether microphone permission has been granted */
  hasPermission: boolean;
  /** Error message if audio initialization failed */
  error: string | null;
  /** Real-time audio frequency data */
  audioData: AudioData;
  /** Enable audio analysis and request microphone access */
  enableAudio: () => Promise<void>;
  /** Disable audio analysis and cleanup resources */
  disableAudio: () => void;
  /** Toggle audio analysis on/off */
  toggleAudio: () => void;
}

/**
 * Props for AudioProvider component
 */
interface AudioProviderProps {
  children: React.ReactNode;
}

/**
 * Audio analysis context for reactive visualizations
 * Manages microphone access and real-time frequency analysis
 */
const AudioContext = createContext<AudioContextValue | null>(null);

/**
 * Default audio data state
 */
const DEFAULT_AUDIO_DATA: AudioData = {
  amplitude: 0,
  bass: 0,
  mid: 0,
  treble: 0,
  frequency: 0
};

/**
 * AudioProvider Component
 * Provides audio analysis functionality to child components
 *
 * Features:
 * - Microphone access management
 * - Real-time FFT frequency analysis
 * - Frequency band separation (bass, mid, treble)
 * - Automatic cleanup on unmount
 *
 * @example
 * ```tsx
 * <AudioProvider>
 *   <YourComponent />
 * </AudioProvider>
 * ```
 */
export function AudioProvider({ children }: AudioProviderProps) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<AudioData>(DEFAULT_AUDIO_DATA);

  // Web Audio API references
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * Analyze audio frequencies and update state
   * Runs in requestAnimationFrame loop when audio is enabled
   */
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    const bufferLength = analyser.frequencyBinCount;

    // Get frequency data
    analyser.getByteFrequencyData(dataArray);

    // Calculate frequency ranges
    // Bass: 0-250 Hz (bins 0-31)
    // Mid: 250-2000 Hz (bins 32-127)
    // Treble: 2000+ Hz (bins 128+)

    const bassEnd = Math.floor(bufferLength * 0.25);
    const midEnd = Math.floor(bufferLength * 0.75);

    let bassSum = 0;
    let midSum = 0;
    let trebleSum = 0;
    let totalSum = 0;

    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] / 255; // Normalize to 0-1

      if (i < bassEnd) {
        bassSum += value;
      } else if (i < midEnd) {
        midSum += value;
      } else {
        trebleSum += value;
      }

      totalSum += value;
    }

    // Calculate averages
    const bass = bassSum / bassEnd;
    const mid = midSum / (midEnd - bassEnd);
    const treble = trebleSum / (bufferLength - midEnd);
    const amplitude = totalSum / bufferLength;

    // Calculate weighted average frequency
    let weightedSum = 0;
    let weightTotal = 0;
    for (let i = 0; i < bufferLength; i++) {
      const weight = dataArray[i] / 255;
      weightedSum += i * weight;
      weightTotal += weight;
    }
    const frequency = weightTotal > 0 ? weightedSum / weightTotal / bufferLength : 0;

    // Update state
    setAudioData({
      amplitude: Math.min(amplitude * 2, 1), // Boost sensitivity
      bass: Math.min(bass * 2, 1),
      mid: Math.min(mid * 2, 1),
      treble: Math.min(treble * 2, 1),
      frequency
    });

    // Continue loop
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, []);

  /**
   * Initialize Web Audio API and request microphone access
   * @throws Will set error state if microphone access is denied or Web Audio API fails
   */
  const enableAudio = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      // Create audio context
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const microphone = audioCtx.createMediaStreamSource(stream);

      // Configure analyzer
      analyser.fftSize = 256; // 128 frequency bins
      analyser.smoothingTimeConstant = 0.8;

      microphone.connect(analyser);

      // Store references
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      setHasPermission(true);
      setIsAudioEnabled(true);
      setError(null);

      // Start analysis loop
      analyzeAudio();

    } catch (err) {
      console.error('Error enabling audio:', err);
      setError(err instanceof Error ? err.message : 'Unknown error enabling audio');
      setHasPermission(false);
    }
  }, [analyzeAudio]);

  /**
   * Disable audio and cleanup resources
   * Stops microphone stream, cancels animation frame, and closes audio context
   */
  const disableAudio = useCallback(() => {
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop microphone stream
    if (microphoneRef.current && microphoneRef.current.mediaStream) {
      microphoneRef.current.mediaStream.getTracks().forEach(track => track.stop());
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    microphoneRef.current = null;
    dataArrayRef.current = null;

    setIsAudioEnabled(false);
    setAudioData(DEFAULT_AUDIO_DATA);
  }, []);

  /**
   * Toggle audio analysis on/off
   */
  const toggleAudio = useCallback(() => {
    if (isAudioEnabled) {
      disableAudio();
    } else {
      enableAudio();
    }
  }, [isAudioEnabled, enableAudio, disableAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disableAudio();
    };
  }, [disableAudio]);

  const value: AudioContextValue = {
    isAudioEnabled,
    hasPermission,
    error,
    audioData,
    enableAudio,
    disableAudio,
    toggleAudio
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

/**
 * useAudio Hook
 * Access audio analysis state and methods from any child component
 *
 * @throws Error if used outside of AudioProvider
 * @returns Audio context value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { audioData, enableAudio } = useAudio();
 *
 *   return (
 *     <button onClick={enableAudio}>
 *       Bass: {audioData.bass.toFixed(2)}
 *     </button>
 *   );
 * }
 * ```
 */
export function useAudio(): AudioContextValue {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
}
