import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { SHADER_DEFINITIONS } from './shaderDefinitions';

/**
 * Animated Gradient Shader Material
 * Creates a flowing gradient animation using sine waves
 */
const shaderDef = SHADER_DEFINITIONS.ANIMATED_GRADIENT;
const AnimatedGradientShaderMaterial = shaderMaterial(
  shaderDef.uniforms,
  shaderDef.vertexShader,
  shaderDef.fragmentShader
);

AnimatedGradientShaderMaterial.depthTest = false;
AnimatedGradientShaderMaterial.depthWrite = false;
AnimatedGradientShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ AnimatedGradientShaderMaterial });

export default AnimatedGradientShaderMaterial;
