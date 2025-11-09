export { AppProvider, useApp } from './context/AppContext';
export type { AppContextValue } from './context/AppContext';

export { useKeyboard } from './hooks/useKeyboard';
export { useStorage } from './hooks/useStorage';

export {
  APP_MODES,
  CONTENT_TYPES,
  GEOMETRY_TYPES,
  DEFAULT_SURFACE_CONFIG,
  KEYBOARD_SHORTCUTS,
  STORAGE_KEYS,
  GRID_SIZE,
  GEOMETRY_SUBDIVISIONS,
  getDefaultCorners
} from './utils/constants';

export * from './schemas';
