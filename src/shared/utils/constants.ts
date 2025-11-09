import type { Corners, GeometryType } from '../schemas';

export const APP_MODES = {
  CALIBRATION: 'calibration',
  PLAYBACK: 'playback'
} as const;

export type AppMode = typeof APP_MODES[keyof typeof APP_MODES];

export const CONTENT_TYPES = {
  CHECKERBOARD: 'checkerboard',
  GRID: 'grid',
  ANIMATED_GRADIENT: 'animated-gradient',
  ROTATING_COLORS: 'rotating-colors',
  PLASMA: 'plasma',
  WAVES: 'waves',
  NOISE: 'noise',
  FIRE: 'fire',
  RAINBOW: 'rainbow',
  KALEIDOSCOPE: 'kaleidoscope',
  GLITCH: 'glitch',
  SPIRAL: 'spiral',
  CUSTOM_SHADER: 'custom-shader',
  WHITE: 'white',
  RED: 'red',
  GREEN: 'green',
  BLUE: 'blue',
  IMAGE: 'image',
  AUDIO_WAVES: 'audio-waves',
  AUDIO_PULSE: 'audio-pulse',
  AUDIO_SPECTRUM: 'audio-spectrum',
  AUDIO_BARS: 'audio-bars'
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];

export const GEOMETRY_TYPES = {
  POLYGON: 'polygon'
} as const;

export const getDefaultCorners = (
  _geometryType: GeometryType = GEOMETRY_TYPES.POLYGON,
  cornerCount: number = 4
): Corners => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.25;

  const numCorners = Math.min(8, Math.max(3, cornerCount));

  const points: Corners = {};
  for (let i = 0; i < numCorners; i++) {
    const angle = (i / numCorners) * Math.PI * 2 - Math.PI / 2;
    points[`point${i}`] = {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  }
  return points;
};

export const DEFAULT_SURFACE_CONFIG = {
  name: 'Surface',
  contentType: CONTENT_TYPES.CHECKERBOARD,
  geometryType: GEOMETRY_TYPES.POLYGON,
  cornerCount: 4,
  visible: true,
  renderOrder: 0,
  audioReactive: false
} as const;

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_MODE: ' ',
  TOGGLE_FULLSCREEN: 'f',
  ADD_SURFACE: 'a',
  DELETE_SURFACE: 'Delete',
  TOGGLE_SIDEBAR: 's'
} as const;

export const STORAGE_KEYS = {
  SURFACES: 'projection_mapping_surfaces',
  APP_STATE: 'projection_mapping_app_state'
} as const;

export const GRID_SIZE = 8;
export const GEOMETRY_SUBDIVISIONS = 20;
