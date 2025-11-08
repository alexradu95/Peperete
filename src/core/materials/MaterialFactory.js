/**
 * Material Factory - Helper functions for creating and managing materials
 */

import { MaterialRegistry } from './MaterialRegistry';
import * as THREE from 'three';

/**
 * Create material props with defaults
 * @param {string} materialId - Material ID
 * @param {Object} overrides - Property overrides
 * @returns {Object} Material props with defaults applied
 */
export function createMaterialProps(materialId, overrides = {}) {
  const material = MaterialRegistry.get(materialId);

  if (!material) {
    console.warn(`Material "${materialId}" not found`);
    return overrides;
  }

  const props = {};

  // Apply defaults from material definition
  for (const [key, propDef] of Object.entries(material.props)) {
    if (propDef.default !== undefined) {
      props[key] = propDef.default;
    }
  }

  // Apply overrides
  return { ...props, ...overrides };
}

/**
 * Get all materials for a specific category
 * @param {string} category - Category name
 * @returns {Array} Array of materials in category
 */
export function getMaterialsByCategory(category) {
  return MaterialRegistry.getByCategory(category);
}

/**
 * Get materials grouped by category for UI display
 * @returns {Object} Object with category names as keys
 */
export function getMaterialsForUI() {
  const grouped = MaterialRegistry.getAllByCategory();

  // Transform into UI-friendly format
  const result = {};
  for (const [category, materials] of Object.entries(grouped)) {
    result[category] = materials.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      audioReactive: m.audioReactive
    }));
  }

  return result;
}

/**
 * Check if material requires audio
 * @param {string} materialId - Material ID
 * @returns {boolean} True if material is audio-reactive
 */
export function isAudioMaterial(materialId) {
  const material = MaterialRegistry.get(materialId);
  return material?.audioReactive || false;
}

/**
 * Get material display name
 * @param {string} materialId - Material ID
 * @returns {string} Display name or ID if not found
 */
export function getMaterialName(materialId) {
  const material = MaterialRegistry.get(materialId);
  return material?.name || materialId;
}

/**
 * Validate material props
 * @param {string} materialId - Material ID
 * @param {Object} props - Props to validate
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
export function validateMaterialProps(materialId, props) {
  const material = MaterialRegistry.get(materialId);

  if (!material) {
    return {
      valid: false,
      errors: [`Material "${materialId}" not found`]
    };
  }

  const errors = [];

  // Check required props
  for (const [key, propDef] of Object.entries(material.props)) {
    if (propDef.required && !(key in props)) {
      errors.push(`Missing required prop: ${key}`);
    }

    // Type checking (basic)
    if (key in props) {
      const value = props[key];

      if (propDef.min !== undefined && value < propDef.min) {
        errors.push(`Prop ${key} is below minimum value ${propDef.min}`);
      }

      if (propDef.max !== undefined && value > propDef.max) {
        errors.push(`Prop ${key} is above maximum value ${propDef.max}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Parse color string to THREE.Color
 * @param {string} colorString - Color string (hex, rgb, etc)
 * @returns {THREE.Color} THREE.Color instance
 */
export function parseColor(colorString) {
  return new THREE.Color(colorString);
}

/**
 * Get all material IDs
 * @returns {string[]} Array of material IDs
 */
export function getAllMaterialIds() {
  return MaterialRegistry.getAll().map(m => m.id);
}

/**
 * Get material count
 * @returns {number} Total number of registered materials
 */
export function getMaterialCount() {
  return MaterialRegistry.count();
}
