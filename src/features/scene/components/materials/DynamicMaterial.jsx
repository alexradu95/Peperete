import React from 'react';
import * as THREE from 'three';
import { MaterialRegistry } from '../../../../core/materials/MaterialRegistry';
import { CONTENT_TYPES } from '../../../../shared/constants';
import { getColorValue } from '../../hooks/useContentManager';
import { ImageMaterial } from './ImageMaterial';

/**
 * DynamicMaterial Component
 * Dynamically renders the appropriate material based on MaterialRegistry
 *
 * Handles:
 * - Basic texture materials (checkerboard, grid)
 * - Solid color materials (white, red, green, blue)
 * - Image materials (with texture loading)
 * - Custom shader materials
 * - Registry-based shader materials (animated, audio-reactive)
 */
export const DynamicMaterial = React.forwardRef(({
  surface,
  materialConfig,
  time,
  audioData,
  texture,
  customShader
}, ref) => {
  const baseProps = {
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false
  };

  // Handle special cases first (basic materials using textures)
  if (surface.contentType === CONTENT_TYPES.CHECKERBOARD ||
      surface.contentType === CONTENT_TYPES.GRID) {
    return <meshBasicMaterial {...baseProps} map={texture} />;
  }

  // Solid colors
  if ([CONTENT_TYPES.WHITE, CONTENT_TYPES.RED, CONTENT_TYPES.GREEN, CONTENT_TYPES.BLUE].includes(surface.contentType)) {
    return <meshBasicMaterial {...baseProps} color={getColorValue(surface.contentType)} />;
  }

  // Image material
  if (surface.contentType === CONTENT_TYPES.IMAGE && surface.contentData?.imageUrl) {
    return <ImageMaterial url={surface.contentData.imageUrl} {...baseProps} />;
  }

  // Custom shader
  if (surface.contentType === CONTENT_TYPES.CUSTOM_SHADER && customShader) {
    const MaterialComponent = materialConfig?.component;
    if (MaterialComponent) {
      return (
        <MaterialComponent
          ref={ref}
          time={time}
          vertexShader={customShader.vertexShader}
          fragmentShader={customShader.fragmentShader}
          uniforms={customShader.uniforms}
          {...baseProps}
        />
      );
    }
  }

  // Registry-based materials (shader materials)
  if (materialConfig && materialConfig.render) {
    const props = { ref, ...baseProps, time };

    // Add audio data if material is audio-reactive
    if (materialConfig.audioReactive && audioData) {
      props.audioAmplitude = audioData.amplitude;
      props.audioBass = audioData.bass;
      props.audioMid = audioData.mid;
      props.audioTreble = audioData.treble;
      props.audioFrequency = audioData.frequency;
    }

    // Use the render function from registry
    return materialConfig.render(props);
  }

  // Fallback: white material
  console.warn(`Material "${surface.contentType}" not found in registry. Using fallback.`);
  return <meshBasicMaterial {...baseProps} color="#ffffff" />;
});

DynamicMaterial.displayName = 'DynamicMaterial';
