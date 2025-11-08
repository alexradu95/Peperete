import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

/**
 * Audio analysis context for reactive visualizations
 * Manages microphone access and real-time frequency analysis
 */

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);

  // Audio data state
  const [audioData, setAudioData] = useState({
    amplitude: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    frequency: 0
  });

  // Web Audio API references
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);

  /**
   * Initialize Web Audio API and request microphone access
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
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
      setError(err.message);
      setHasPermission(false);
    }
  }, []);

  /**
   * Disable audio and cleanup resources
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
    setAudioData({
      amplitude: 0,
      bass: 0,
      mid: 0,
      treble: 0,
      frequency: 0
    });
  }, []);

  /**
   * Analyze audio frequencies and update state
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
   * Toggle audio on/off
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

  const value = {
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

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
}
