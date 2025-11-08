import React, { useRef, useMemo } from 'react';
import { MaterialRegistry } from '../../../core/materials/MaterialRegistry';
import { useContentManager } from '../hooks';
import { CONTENT_TYPES } from '../../../shared/constants';
import { useSurfaceGeometry, useSurfaceAnimation } from '../hooks';
import { DynamicMaterial } from './materials';

/**
 * Surface Component
 * Renders a single projection surface with perspective transformation
 *
 * REFACTORED: Reduced from 201 lines to ~80 lines
 * Extracted hooks: useSurfaceGeometry, useSurfaceAnimation
 * Extracted components: DynamicMaterial, ImageMaterial
 */
export function Surface({ surface }) {
  const meshRef = useRef();
  const materialRef = useRef();

  const { createCheckerboardTexture, createGridTexture } = useContentManager();

  // Use custom hooks for geometry and animation
  const geometry = useSurfaceGeometry(surface, meshRef);
  const { time, audioData } = useSurfaceAnimation(materialRef);

  // Prepare texture for basic materials
  const texture = useMemo(() => {
    switch (surface.contentType) {
      case CONTENT_TYPES.CHECKERBOARD:
        return createCheckerboardTexture();
      case CONTENT_TYPES.GRID:
        return createGridTexture();
      default:
        return null;
    }
  }, [surface.contentType, createCheckerboardTexture, createGridTexture]);

  // Prepare custom shader data
  const customShader = useMemo(() => {
    if (surface.contentType === CONTENT_TYPES.CUSTOM_SHADER) {
      return surface.contentData?.shaderData;
    }
    return null;
  }, [surface.contentType, surface.contentData]);

  // Don't render if not visible
  if (!surface.visible) {
    return null;
  }

  // Get material configuration from registry
  const materialConfig = MaterialRegistry.get(surface.contentType);

  // Debug: Log if material not found
  if (!materialConfig && surface.contentType) {
    console.warn(`Material "${surface.contentType}" not found. Available materials:`,
      MaterialRegistry.getAll().map(m => m.id));
  }

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      renderOrder={surface.renderOrder || 0}
    >
      <DynamicMaterial
        ref={materialRef}
        surface={surface}
        materialConfig={materialConfig}
        time={time}
        audioData={audioData}
        texture={texture}
        customShader={customShader}
      />
    </mesh>
  );
}
