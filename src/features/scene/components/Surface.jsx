import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TransformCalculator } from '../../../core/transformation/TransformCalculator';
import { useContentManager, getColorValue } from '../hooks/useContentManager';
import { CONTENT_TYPES, GEOMETRY_SUBDIVISIONS, GEOMETRY_TYPES } from '../../../shared/constants';
import { GeometryGenerator } from '../../../core/geometry/GeometryGenerator';
import { useAudio } from '../../../shared/context/AudioContext';
import AnimatedGradientShaderMaterial from '../materials/AnimatedGradientMaterial';
import RotatingColorsShaderMaterial from '../materials/RotatingColorsMaterial';
import PlasmaShaderMaterial from '../materials/PlasmaMaterial';
import WavesShaderMaterial from '../materials/WavesMaterial';
import NoiseShaderMaterial from '../materials/NoiseMaterial';
import FireShaderMaterial from '../materials/FireMaterial';
import RainbowShaderMaterial from '../materials/RainbowMaterial';
import KaleidoscopeShaderMaterial from '../materials/KaleidoscopeMaterial';
import GlitchShaderMaterial from '../materials/GlitchMaterial';
import SpiralShaderMaterial from '../materials/SpiralMaterial';
import AudioWavesShaderMaterial from '../materials/AudioWavesMaterial';
import AudioPulseShaderMaterial from '../materials/AudioPulseMaterial';
import AudioSpectrumShaderMaterial from '../materials/AudioSpectrumMaterial';
import AudioBarsShaderMaterial from '../materials/AudioBarsMaterial';
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

  // Create material based on content type
  const materialProps = useMemo(() => {
    const baseProps = {
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false
    };

    switch (surface.contentType) {
      case CONTENT_TYPES.CHECKERBOARD:
        return {
          type: 'meshBasicMaterial',
          props: {
            ...baseProps,
            map: createCheckerboardTexture()
          }
        };

      case CONTENT_TYPES.GRID:
        return {
          type: 'meshBasicMaterial',
          props: {
            ...baseProps,
            map: createGridTexture()
          }
        };

      case CONTENT_TYPES.WHITE:
      case CONTENT_TYPES.RED:
      case CONTENT_TYPES.GREEN:
      case CONTENT_TYPES.BLUE:
        return {
          type: 'meshBasicMaterial',
          props: {
            ...baseProps,
            color: getColorValue(surface.contentType)
          }
        };

      case CONTENT_TYPES.ANIMATED_GRADIENT:
        return {
          type: 'animatedGradient',
          props: baseProps
        };

      case CONTENT_TYPES.ROTATING_COLORS:
        return {
          type: 'rotatingColors',
          props: baseProps
        };

      case CONTENT_TYPES.PLASMA:
        return {
          type: 'plasma',
          props: baseProps
        };

      case CONTENT_TYPES.WAVES:
        return {
          type: 'waves',
          props: baseProps
        };

      case CONTENT_TYPES.NOISE:
        return {
          type: 'noise',
          props: baseProps
        };

      case CONTENT_TYPES.FIRE:
        return {
          type: 'fire',
          props: baseProps
        };

      case CONTENT_TYPES.RAINBOW:
        return {
          type: 'rainbow',
          props: baseProps
        };

      case CONTENT_TYPES.KALEIDOSCOPE:
        return {
          type: 'kaleidoscope',
          props: baseProps
        };

      case CONTENT_TYPES.GLITCH:
        return {
          type: 'glitch',
          props: baseProps
        };

      case CONTENT_TYPES.SPIRAL:
        return {
          type: 'spiral',
          props: baseProps
        };

      case CONTENT_TYPES.AUDIO_WAVES:
        return {
          type: 'audioWaves',
          props: baseProps
        };

      case CONTENT_TYPES.AUDIO_PULSE:
        return {
          type: 'audioPulse',
          props: baseProps
        };

      case CONTENT_TYPES.AUDIO_SPECTRUM:
        return {
          type: 'audioSpectrum',
          props: baseProps
        };

      case CONTENT_TYPES.AUDIO_BARS:
        return {
          type: 'audioBars',
          props: baseProps
        };

      case CONTENT_TYPES.CUSTOM_SHADER:
        return {
          type: 'customShader',
          props: {
            ...baseProps,
            shaderData: surface.contentData?.shaderData
          }
        };

      case CONTENT_TYPES.IMAGE:
        return {
          type: 'image',
          props: {
            ...baseProps,
            imageUrl: surface.contentData?.imageUrl
          }
        };

      default:
        return {
          type: 'meshBasicMaterial',
          props: {
            ...baseProps,
            color: 0xffffff
          }
        };
    }
  }, [surface.contentType, surface.contentData, createCheckerboardTexture, createGridTexture]);

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
      {materialProps.type === 'animatedGradient' && (
        <animatedGradientShaderMaterial ref={materialRef} {...materialProps.props} />
      )}
      {materialProps.type === 'rotatingColors' && (
        <rotatingColorsShaderMaterial ref={materialRef} {...materialProps.props} />
      )}
      {materialProps.type === 'plasma' && (
        <plasmaShaderMaterial ref={materialRef} {...materialProps.props} />
      )}
      {materialProps.type === 'waves' && (
        <wavesShaderMaterial ref={materialRef} {...materialProps.props} />
      )}
      {materialProps.type === 'noise' && (
        <noiseShaderMaterial ref={materialRef} {...materialProps.props} />
      )}
      {materialProps.type === 'fire' && (
        <fireShaderMaterial ref={materialRef} {...materialProps.props} />
      )}
      {materialProps.type === 'rainbow' && (
        <rainbowShaderMaterial ref={materialRef} {...materialProps.props} />
      )}
      {materialProps.type === 'kaleidoscope' && (
        <kaleidoscopeShaderMaterial ref={materialRef} {...materialProps.props} />
      )}
      {materialProps.type === 'glitch' && (
        <glitchShaderMaterial ref={materialRef} {...materialProps.props} />
      )}
      {materialProps.type === 'spiral' && (
        <spiralShaderMaterial ref={materialRef} {...materialProps.props} />
      )}
      {materialProps.type === 'meshBasicMaterial' && (
        <meshBasicMaterial {...materialProps.props} />
      )}
      {materialProps.type === 'image' && materialProps.props.imageUrl && (
        <ImageMaterial url={materialProps.props.imageUrl} {...materialProps.props} />
      )}
    </mesh>
  );
}

/**
 * Image Material Component
 * Loads and displays an image texture
 */
function ImageMaterial({ url, ...props }) {
  const texture = useLoader(THREE.TextureLoader, url);

  return <meshBasicMaterial map={texture} {...props} />;
}
