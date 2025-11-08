/**
 * Material System Type Definitions
 */

/**
 * Material categories
 */
export const MATERIAL_CATEGORIES = {
  BASIC: 'basic',
  ANIMATED: 'animated',
  AUDIO: 'audio',
  CUSTOM: 'custom'
};

/**
 * Material property types
 */
export const MATERIAL_PROP_TYPES = {
  FLOAT: 'float',
  INT: 'int',
  VECTOR2: 'vector2',
  VECTOR3: 'vector3',
  COLOR: 'color',
  TEXTURE: 'texture',
  BOOLEAN: 'boolean'
};

/**
 * @typedef {Object} MaterialPropDefinition
 * @property {string} type - Property type (from MATERIAL_PROP_TYPES)
 * @property {*} default - Default value
 * @property {number} [min] - Minimum value (for numeric types)
 * @property {number} [max] - Maximum value (for numeric types)
 * @property {string} [description] - Property description
 */

/**
 * @typedef {Object} MaterialConfig
 * @property {string} id - Unique material identifier
 * @property {string} name - Display name for UI
 * @property {string} category - Category (from MATERIAL_CATEGORIES)
 * @property {React.Component} component - Material component
 * @property {Object.<string, MaterialPropDefinition>} props - Material properties
 * @property {boolean} audioReactive - Whether material reacts to audio
 * @property {string} description - Material description
 */
