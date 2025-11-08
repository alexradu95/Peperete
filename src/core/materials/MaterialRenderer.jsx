/**
 * Material Renderer - Dynamically renders materials based on content type
 *
 * This component replaces the massive switch statement in Surface.jsx.
 * It uses the MaterialRegistry to look up and render the appropriate material.
 */

import React, { useMemo } from 'react';
import { MaterialRegistry } from './MaterialRegistry';
import { useAudio } from '../../shared/context/AudioContext';

/**
 * MaterialRenderer component
 * @param {Object} props
 * @param {Object} props.surface - Surface configuration
 * @param {number} props.time - Animation time
 * @param {THREE.Texture} [props.texture] - Texture for image/video content
 * @param {Object} [props.customShader] - Custom shader configuration
 */
export function MaterialRenderer({ surface, time, texture, customShader }) {
  const { audioData } = useAudio();
  const { contentType } = surface;

  // Get material configuration from registry
  const materialConfig = useMemo(() => {
    return MaterialRegistry.get(contentType);
  }, [contentType]);

  // Prepare material props based on content type and surface config
  const materialProps = useMemo(() => {
    const props = { time };

    // Add audio data if material is audio-reactive
    if (materialConfig?.audioReactive && audioData) {
      props.audioData = audioData;
      props.amplitude = audioData.amplitude;
      props.bass = audioData.bass;
      props.mid = audioData.mid;
      props.treble = audioData.treble;
      props.frequency = audioData.frequency;
    }

    // Add texture for image/video content
    if (texture) {
      props.map = texture;
    }

    // Add custom shader props
    if (customShader) {
      props.vertexShader = customShader.vertexShader;
      props.fragmentShader = customShader.fragmentShader;
      props.uniforms = customShader.uniforms;
    }

    // Add surface-specific props
    if (surface.color) props.color = surface.color;
    if (surface.speed !== undefined) props.speed = surface.speed;
    if (surface.scale !== undefined) props.scale = surface.scale;
    if (surface.intensity !== undefined) props.intensity = surface.intensity;

    return props;
  }, [materialConfig, time, audioData, texture, customShader, surface]);

  // If material not found in registry, show error material
  if (!materialConfig) {
    console.warn(`Material "${contentType}" not found in registry`);
    return (
      <meshBasicMaterial color="#ff0000" wireframe />
    );
  }

  const MaterialComponent = materialConfig.component;

  return <MaterialComponent {...materialProps} />;
}
