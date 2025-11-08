/**
 * Basic Materials
 *
 * Simple patterns and solid colors
 * These are handled via textures and basic materials
 */

import { MaterialRegistry } from '../../../core/materials/MaterialRegistry';
import * as THREE from 'three';

// Note: Checkerboard, Grid, and Image materials are handled differently
// They use textures generated in useContentManager
// We register them here for UI purposes

MaterialRegistry.register({
  id: 'checkerboard',
  name: 'Checkerboard',
  category: 'basic',
  component: null, // Handled via texture in Surface component
  props: {},
  audioReactive: false,
  description: 'Classic checkerboard pattern for calibration'
});

MaterialRegistry.register({
  id: 'grid',
  name: 'Grid',
  category: 'basic',
  component: null,
  props: {},
  audioReactive: false,
  description: 'Grid pattern for alignment'
});

// Solid Colors
const solidColors = [
  { id: 'white', name: 'White', color: '#ffffff' },
  { id: 'red', name: 'Red', color: '#ff0000' },
  { id: 'green', name: 'Green', color: '#00ff00' },
  { id: 'blue', name: 'Blue', color: '#0000ff' }
];

solidColors.forEach(({ id, name, color }) => {
  MaterialRegistry.register({
    id,
    name,
    category: 'basic',
    component: null, // Handled via meshBasicMaterial in Surface component
    props: { color: { type: 'color', default: color } },
    audioReactive: false,
    description: `Solid ${name.toLowerCase()} color`
  });
});

// Image material
MaterialRegistry.register({
  id: 'image',
  name: 'Image',
  category: 'basic',
  component: null, // Handled via texture loader in Surface component
  props: {
    imageUrl: { type: 'string', default: '' }
  },
  audioReactive: false,
  description: 'Display custom image'
});
