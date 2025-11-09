import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { SHADER_DEFINITIONS } from './shaderDefinitions';

/**
 * Waves Shader Material
 * Creates animated wave/ripple effects
 */
const shaderDef = SHADER_DEFINITIONS.WAVES;
const WavesShaderMaterial = shaderMaterial(
  shaderDef.uniforms,
  shaderDef.vertexShader,
  shaderDef.fragmentShader
);

WavesShaderMaterial.depthTest = false;
WavesShaderMaterial.depthWrite = false;
WavesShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ WavesShaderMaterial });

export default WavesShaderMaterial;
