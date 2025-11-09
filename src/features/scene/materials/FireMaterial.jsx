import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { SHADER_DEFINITIONS } from './shaderDefinitions';

/**
 * Fire Shader Material
 * Creates a realistic fire/flame effect
 */
const shaderDef = SHADER_DEFINITIONS.FIRE;
const FireShaderMaterial = shaderMaterial(
  shaderDef.uniforms,
  shaderDef.vertexShader,
  shaderDef.fragmentShader
);

FireShaderMaterial.depthTest = false;
FireShaderMaterial.depthWrite = false;
FireShaderMaterial.side = THREE.DoubleSide;

// Extend R3F with custom material
extend({ FireShaderMaterial });

export default FireShaderMaterial;
