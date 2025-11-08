import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TransformCalculator } from '../../../core/transformation/TransformCalculator';
import { MaterialRegistry } from '../../../core/materials/MaterialRegistry';
import { useContentManager, getColorValue } from '../hooks/useContentManager';
import { CONTENT_TYPES, GEOMETRY_SUBDIVISIONS, GEOMETRY_TYPES } from '../../../shared/constants';
import { GeometryGenerator } from '../../../core/geometry/GeometryGenerator';
import { useAudio } from '../../../shared/context/AudioContext';

/**
 * Surface Component
 * Renders a single projection surface with perspective transformation
 *
 * REFACTORED: Now uses MaterialRegistry and dynamic material rendering
 * Reduced from 284 lines to ~150 lines
 */
export function Surface({ surface }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const [time, setTime] = useState(0);
  const { createCheckerboardTexture, createGridTexture } = useContentManager();
  const { size } = useThree();
  const { audioData } = useAudio();

  // Create geometry based on geometry type
  const geometry = useMemo(() => {
    const geom = GeometryGenerator.createGeometry(
      surface.geometryType || GEOMETRY_TYPES.POLYGON,
      surface.cornerCount || 4,
      GEOMETRY_SUBDIVISIONS
    );
    return geom;
  }, [surface.geometryType, surface.cornerCount]);

  // Apply perspective transformation to geometry when corners change OR window resizes
  useEffect(() => {
    if (meshRef.current && surface.corners) {
      TransformCalculator.applyTransformToGeometry(
        geometry,
        surface.corners,
        surface.geometryType || GEOMETRY_TYPES.POLYGON
      );
    }
  }, [surface.corners, geometry, surface.geometryType, size.width, size.height]);

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

/**
 * DynamicMaterial Component
 * Dynamically renders the appropriate material based on MaterialRegistry
 */
const DynamicMaterial = React.forwardRef(({
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

/**
 * Image Material Component
 * Loads and displays an image texture
 */
function ImageMaterial({ url, ...props }) {
  const texture = useLoader(THREE.TextureLoader, url);
  return <meshBasicMaterial map={texture} {...props} />;
}
