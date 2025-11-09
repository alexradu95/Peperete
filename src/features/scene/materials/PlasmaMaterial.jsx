import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { SHADER_DEFINITIONS } from './shaderDefinitions';

/**
 * Plasma Shader Material
 * Creates a classic plasma effect with flowing colors
 */
const shaderDef = SHADER_DEFINITIONS.PLASMA;
const PlasmaShaderMaterial = shaderMaterial(
  shaderDef.uniforms,
  shaderDef.vertexShader,
  shaderDef.fragmentShader
);

PlasmaShaderMaterial.depthTest = false;
PlasmaShaderMaterial.depthWrite = false;
PlasmaShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ PlasmaShaderMaterial });

export default PlasmaShaderMaterial;
