import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TransformCalculator } from '../../calibration/utils/TransformCalculator';
import { useContentManager, getColorValue } from '../hooks/useContentManager';
import { GEOMETRY_SUBDIVISIONS, GEOMETRY_TYPES } from '../../../shared/utils/constants';
import { GeometryGenerator } from '../utils/GeometryGenerator';
import { useAudio } from '../../../shared/context/AudioContext';
import { getMaterialConfig } from '../materials/materialConfig';
import { CustomShaderMaterial } from '../materials/CustomShaderMaterial';

/**
 * Surface Component
 * Renders a single projection surface with perspective transformation
 */
export function Surface({ surface }) {
  const meshRef = useRef();
  const materialRef = useRef();
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

  // Get material configuration from registry
  const materialConfig = useMemo(() => {
    return getMaterialConfig(surface.contentType);
  }, [surface.contentType]);

  // Build material props from configuration
  const materialProps = useMemo(() => {
    const baseProps = {
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false
    };

    const context = {
      createCheckerboardTexture,
      createGridTexture,
      getColorValue
    };

    // Get custom props from config
    const customProps = materialConfig.getProps
      ? materialConfig.getProps(context, surface)
      : materialConfig.staticProps || {};

    return {
      type: materialConfig.type,
      requiresRef: materialConfig.requiresRef,
      props: {
        ...baseProps,
        ...customProps
      }
    };
  }, [
    surface.contentType,
    surface.contentData,
    materialConfig,
    createCheckerboardTexture,
    createGridTexture
  ]);

  // Animation loop for shader materials
  useFrame((state, delta) => {
    if (materialRef.current && materialRef.current.uniforms) {
      materialRef.current.uniforms.time.value += delta;

      // Update audio uniforms for audio-reactive materials
      if (materialRef.current.uniforms.audioAmplitude !== undefined) {
        materialRef.current.uniforms.audioAmplitude.value = audioData.amplitude;
        materialRef.current.uniforms.audioBass.value = audioData.bass;
        materialRef.current.uniforms.audioMid.value = audioData.mid;
        materialRef.current.uniforms.audioTreble.value = audioData.treble;
        materialRef.current.uniforms.audioFrequency.value = audioData.frequency;
      }
    }
  });

  // Don't render if not visible
  if (!surface.visible) {
    return null;
  }

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      renderOrder={surface.renderOrder || 0}
    >
      <MaterialRenderer
        type={materialProps.type}
        props={materialProps.props}
        materialRef={materialProps.requiresRef ? materialRef : undefined}
      />
    </mesh>
  );
}

/**
 * Material Renderer Component
 * Dynamically renders the appropriate material based on type
 *
 * This eliminates the need for 15+ conditional renders in the Surface component
 */
function MaterialRenderer({ type, props, materialRef }) {
  // Handle special material types
  if (type === 'image' && props.imageUrl) {
    return <ImageMaterial url={props.imageUrl} {...props} />;
  }

  if (type === 'customShader') {
    return (
      <CustomShaderMaterial
        vertexShader={props.shaderData?.vertexShader}
        fragmentShader={props.shaderData?.fragmentShader}
        uniforms={props.shaderData?.uniforms}
        {...props}
      />
    );
  }

  // Handle standard Three.js materials
  if (type === 'meshBasicMaterial') {
    return <meshBasicMaterial {...props} />;
  }

  // Handle custom shader materials
  // React Three Fiber allows us to use custom materials as JSX elements
  // by using lowercase element names that match the extended material names
  const MaterialComponent = type + 'ShaderMaterial';

  return React.createElement(MaterialComponent, {
    ref: materialRef,
    ...props
  });
}

/**
 * Image Material Component
 * Loads and displays an image texture
 */
function ImageMaterial({ url, ...props }) {
  const texture = useLoader(THREE.TextureLoader, url);

  return <meshBasicMaterial map={texture} {...props} />;
}
