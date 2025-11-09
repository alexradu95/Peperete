import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { SHADER_DEFINITIONS } from './shaderDefinitions';

/**
 * Kaleidoscope Shader Material
 * Creates a symmetric kaleidoscope pattern
 */
const shaderDef = SHADER_DEFINITIONS.KALEIDOSCOPE;
const KaleidoscopeShaderMaterial = shaderMaterial(
  shaderDef.uniforms,
  shaderDef.vertexShader,
  shaderDef.fragmentShader
);

KaleidoscopeShaderMaterial.depthTest = false;
KaleidoscopeShaderMaterial.depthWrite = false;
KaleidoscopeShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ KaleidoscopeShaderMaterial });

export default KaleidoscopeShaderMaterial;
