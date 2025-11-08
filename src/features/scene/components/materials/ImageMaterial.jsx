import React from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ImageMaterial Component
 * Loads and displays an image texture
 */
export function ImageMaterial({ url, ...props }) {
  const texture = useLoader(THREE.TextureLoader, url);
  return <meshBasicMaterial map={texture} {...props} />;
}
