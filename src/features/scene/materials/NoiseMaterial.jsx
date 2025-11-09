import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { SHADER_DEFINITIONS } from './shaderDefinitions';

/**
 * Noise Shader Material
 * Creates animated noise patterns using simplex-like noise
 */
const shaderDef = SHADER_DEFINITIONS.NOISE;
const NoiseShaderMaterial = shaderMaterial(
  shaderDef.uniforms,
  shaderDef.vertexShader,
  shaderDef.fragmentShader
);

NoiseShaderMaterial.depthTest = false;
NoiseShaderMaterial.depthWrite = false;
NoiseShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ NoiseShaderMaterial });

export default NoiseShaderMaterial;
