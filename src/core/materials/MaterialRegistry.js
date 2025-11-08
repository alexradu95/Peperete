/**
 * Material Registry - Singleton pattern for managing material plugins
 *
 * This registry allows materials to self-register and provides a centralized
 * way to access all available materials for rendering and UI generation.
 *
 * Usage:
 *
 * // In a material file:
 * import { MaterialRegistry } from '@/core/materials/MaterialRegistry';
 *
 * MaterialRegistry.register({
 *   id: 'plasma',
 *   name: 'Plasma',
 *   category: 'animated',
 *   component: PlasmaShaderMaterial,
 *   props: {
 *     time: { type: 'float', default: 0 },
 *     speed: { type: 'float', default: 1.0 },
 *     color1: { type: 'color', default: '#ff0000' },
 *     color2: { type: 'color', default: '#0000ff' }
 *   },
 *   audioReactive: false,
 *   description: 'Animated plasma effect'
 * });
 */

class MaterialRegistryClass {
  constructor() {
    if (MaterialRegistryClass.instance) {
      return MaterialRegistryClass.instance;
    }

    this.materials = new Map();
    this.categories = new Map();
    MaterialRegistryClass.instance = this;
  }

  /**
   * Register a material
   * @param {Object} config - Material configuration
   * @param {string} config.id - Unique material identifier (matches CONTENT_TYPES)
   * @param {string} config.name - Display name for UI
   * @param {string} config.category - Category: 'basic', 'animated', 'audio', 'custom'
   * @param {React.Component} config.component - Material component
   * @param {Object} config.props - Material properties/uniforms
   * @param {boolean} config.audioReactive - Whether material reacts to audio
   * @param {string} config.description - Material description
   */
  register(config) {
    const {
      id,
      name,
      category,
      component,
      props = {},
      audioReactive = false,
      description = ''
    } = config;

    if (!id || !name || !category || !component) {
      console.error('Material registration failed: missing required fields', config);
      return;
    }

    if (this.materials.has(id)) {
      console.warn(`Material "${id}" is already registered. Overwriting.`);
    }

    const material = {
      id,
      name,
      category,
      component,
      props,
      audioReactive,
      description
    };

    this.materials.set(id, material);

    // Add to category map
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category).push(material);

    console.log(`✓ Material registered: ${name} (${id}) in category ${category}`);
  }

  /**
   * Get a material by ID
   * @param {string} id - Material ID
   * @returns {Object|null} Material configuration or null if not found
   */
  get(id) {
    return this.materials.get(id) || null;
  }

  /**
   * Get all materials
   * @returns {Array} Array of all material configurations
   */
  getAll() {
    return Array.from(this.materials.values());
  }

  /**
   * Get materials by category
   * @param {string} category - Category name
   * @returns {Array} Array of materials in the category
   */
  getByCategory(category) {
    return this.categories.get(category) || [];
  }

  /**
   * Get all categories
   * @returns {Array} Array of category names
   */
  getCategories() {
    return Array.from(this.categories.keys());
  }

  /**
   * Get materials grouped by category
   * @returns {Object} Object with categories as keys and material arrays as values
   */
  getAllByCategory() {
    const grouped = {};
    for (const [category, materials] of this.categories.entries()) {
      grouped[category] = materials;
    }
    return grouped;
  }

  /**
   * Check if a material is registered
   * @param {string} id - Material ID
   * @returns {boolean} True if material exists
   */
  has(id) {
    return this.materials.has(id);
  }

  /**
   * Unregister a material (useful for testing)
   * @param {string} id - Material ID
   */
  unregister(id) {
    const material = this.materials.get(id);
    if (material) {
      this.materials.delete(id);

      // Remove from category
      const categoryMaterials = this.categories.get(material.category);
      if (categoryMaterials) {
        const index = categoryMaterials.findIndex(m => m.id === id);
        if (index !== -1) {
          categoryMaterials.splice(index, 1);
        }
      }
    }
  }

  /**
   * Clear all materials (useful for testing)
   */
  clear() {
    this.materials.clear();
    this.categories.clear();
  }

  /**
   * Get material count
   * @returns {number} Total number of registered materials
   */
  count() {
    return this.materials.size;
  }

  /**
   * Get audio-reactive materials
   * @returns {Array} Array of audio-reactive materials
   */
  getAudioReactive() {
    return this.getAll().filter(m => m.audioReactive);
  }
}

// Export singleton instance
export const MaterialRegistry = new MaterialRegistryClass();

// Export class for testing
export { MaterialRegistryClass };
