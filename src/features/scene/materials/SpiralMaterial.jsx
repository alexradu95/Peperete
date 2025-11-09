import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { SHADER_DEFINITIONS } from './shaderDefinitions';

/**
 * Spiral Shader Material
 * Creates a hypnotic spiral pattern
 */
const shaderDef = SHADER_DEFINITIONS.SPIRAL;
const SpiralShaderMaterial = shaderMaterial(
  shaderDef.uniforms,
  shaderDef.vertexShader,
  shaderDef.fragmentShader
);

SpiralShaderMaterial.depthTest = false;
SpiralShaderMaterial.depthWrite = false;
SpiralShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ SpiralShaderMaterial });

export default SpiralShaderMaterial;
