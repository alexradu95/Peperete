import React, { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useSurfaces } from '../../surface-manager/context/SurfaceContext';
import { Surface } from './Surface';

/**
 * Camera updater component
 * Updates orthographic camera on window resize
 */
function CameraUpdater() {
  const { camera, size } = useThree();

  useEffect(() => {
    if (camera.isOrthographicCamera) {
      const aspect = size.width / size.height;
      camera.left = -aspect;
      camera.right = aspect;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
    }
  }, [camera, size]);

  return null;
}

/**
 * Main 3D Scene Component
 * Sets up R3F Canvas with orthographic camera and renders all surfaces
 */
export function Scene() {
  const { getAllSurfaces } = useSurfaces();
  const surfaces = getAllSurfaces();

  return (
    <Canvas
      orthographic
      camera={{
        left: -window.innerWidth / window.innerHeight,
        right: window.innerWidth / window.innerHeight,
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
      resize={{ scroll: false }}
    >
      <CameraUpdater />

      {/* Render all surfaces */}
      {surfaces.map(surface => (
        <Surface key={surface.id} surface={surface} />
      ))}
    </Canvas>
  );
}
