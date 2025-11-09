import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { SHADER_DEFINITIONS } from './shaderDefinitions';

/**
 * Rainbow Spectrum Shader Material
 * Creates a flowing rainbow gradient effect
 */
const shaderDef = SHADER_DEFINITIONS.RAINBOW;
const RainbowShaderMaterial = shaderMaterial(
  shaderDef.uniforms,
  shaderDef.vertexShader,
  shaderDef.fragmentShader
);

RainbowShaderMaterial.depthTest = false;
RainbowShaderMaterial.depthWrite = false;
RainbowShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ RainbowShaderMaterial });

export default RainbowShaderMaterial;
