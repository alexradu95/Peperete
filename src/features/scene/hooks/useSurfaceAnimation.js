import { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAudio } from '../../../shared/context/AudioContext';

/**
 * useSurfaceAnimation Hook
 *
 * Manages animation time and updates shader uniforms for materials
 * - Increments time on each frame
 * - Updates time uniform for animated materials
 * - Updates audio uniforms for audio-reactive materials
 */
export function useSurfaceAnimation(materialRef) {
  const [time, setTime] = useState(0);
  const { audioData } = useAudio();

  // Animation loop for shader materials
  useFrame((state, delta) => {
    setTime(t => t + delta);

    // Update audio uniforms for audio-reactive materials
    if (materialRef.current && materialRef.current.uniforms) {
      if (materialRef.current.uniforms.time !== undefined) {
        materialRef.current.uniforms.time.value = time;
      }

      if (materialRef.current.uniforms.audioAmplitude !== undefined) {
        materialRef.current.uniforms.audioAmplitude.value = audioData.amplitude;
        materialRef.current.uniforms.audioBass.value = audioData.bass;
        materialRef.current.uniforms.audioMid.value = audioData.mid;
        materialRef.current.uniforms.audioTreble.value = audioData.treble;
        materialRef.current.uniforms.audioFrequency.value = audioData.frequency;
      }
    }
  });

  return { time, audioData };
}
