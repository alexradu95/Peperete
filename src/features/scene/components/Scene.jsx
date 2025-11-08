import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useSurfaces } from '../../surface-manager/context/SurfaceContext';
import { Surface } from './Surface';

/**
 * Main 3D Scene Component
 * Sets up R3F Canvas with orthographic camera and renders all surfaces
 */
export function Scene() {
  const { getAllSurfaces } = useSurfaces();
  const surfaces = getAllSurfaces();

  // Calculate aspect ratio for orthographic camera
  const aspect = useMemo(() => {
    return window.innerWidth / window.innerHeight;
  }, []);

  return (
    <Canvas
      orthographic
      camera={{
        left: -aspect,
        right: aspect,
        top: 1,
        bottom: -1,
        near: 0.1,
        far: 10,
        position: [0, 0, 5]
      }}
      gl={{
        antialias: true,
        alpha: false
      }}
      style={{
        width: '100%',
        height: '100vh',
        display: 'block'
      }}
    >
      {/* Render all surfaces */}
      {surfaces.map(surface => (
        <Surface key={surface.id} surface={surface} />
      ))}
    </Canvas>
  );
}
