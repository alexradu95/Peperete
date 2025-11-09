import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { SHADER_DEFINITIONS } from './shaderDefinitions';

/**
 * Glitch Shader Material
 * Creates a digital glitch/corruption effect
 */
const shaderDef = SHADER_DEFINITIONS.GLITCH;
const GlitchShaderMaterial = shaderMaterial(
  shaderDef.uniforms,
  shaderDef.vertexShader,
  shaderDef.fragmentShader
);

GlitchShaderMaterial.depthTest = false;
GlitchShaderMaterial.depthWrite = false;
GlitchShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ GlitchShaderMaterial });

export default GlitchShaderMaterial;
