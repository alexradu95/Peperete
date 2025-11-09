import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { SHADER_DEFINITIONS } from './shaderDefinitions';

/**
 * Rotating Colors Shader Material
 * Creates a rotating color wheel effect using HSV
 */
const shaderDef = SHADER_DEFINITIONS.ROTATING_COLORS;
const RotatingColorsShaderMaterial = shaderMaterial(
  shaderDef.uniforms,
  shaderDef.vertexShader,
  shaderDef.fragmentShader
);

RotatingColorsShaderMaterial.depthTest = false;
RotatingColorsShaderMaterial.depthWrite = false;
RotatingColorsShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ RotatingColorsShaderMaterial });

export default RotatingColorsShaderMaterial;
