# Configuration Variables Reference

## Overview

This document catalogues all configuration constants, environment variables, and tunable parameters in the Peperete projection mapping application.

## Application Constants

### Location: `src/shared/utils/constants.js`

#### App Modes

```javascript
export const APP_MODES = {
  CALIBRATION: 'calibration',  // Edit mode with UI controls
  PLAYBACK: 'playback'         // Full-screen output mode
};
```

**Usage**: Determines whether UI controls are visible
**Default**: `CALIBRATION`

---

#### Content Types

```javascript
export const CONTENT_TYPES = {
  // Patterns
  CHECKERBOARD: 'checkerboard',        // Black/white checkerboard pattern
  GRID: 'grid',                        // Numbered grid pattern

  // Solid Colors
  WHITE: 'white',                      // Solid white
  RED: 'red',                          // Solid red
  GREEN: 'green',                      // Solid green
  BLUE: 'blue',                        // Solid blue

  // Shader Effects
  ANIMATED_GRADIENT: 'animated-gradient',  // Animated color gradient
  ROTATING_COLORS: 'rotating-colors',      // RGB color rotation
  PLASMA: 'plasma',                        // Plasma effect
  WAVES: 'waves',                          // Wave distortion
  NOISE: 'noise',                          // Perlin noise
  FIRE: 'fire',                            // Fire effect
  RAINBOW: 'rainbow',                      // Rainbow gradient
  KALEIDOSCOPE: 'kaleidoscope',           // Kaleidoscope effect
  GLITCH: 'glitch',                        // Glitch distortion
  SPIRAL: 'spiral',                        // Spiral pattern

  // Audio-Reactive
  AUDIO_WAVES: 'audio-waves',             // Audio-reactive waves
  AUDIO_PULSE: 'audio-pulse',             // Audio pulse effect
  AUDIO_SPECTRUM: 'audio-spectrum',       // Audio spectrum visualizer
  AUDIO_BARS: 'audio-bars',               // Audio bar graph

  // Custom
  CUSTOM_SHADER: 'custom-shader',         // User-defined shader
  IMAGE: 'image'                          // Image texture
};
```

**Usage**: Determines material/content displayed on surface

---

#### Geometry Types

```javascript
export const GEOMETRY_TYPES = {
  POLYGON: 'polygon'  // N-sided polygon (3-8 corners)
};
```

**Usage**: Determines surface shape
**Note**: Currently only polygon type implemented. Future: CIRCLE, RECTANGLE, etc.

---

#### Keyboard Shortcuts

```javascript
export const KEYBOARD_SHORTCUTS = {
  TOGGLE_MODE: ' ',           // Space - Toggle calibration/playback
  TOGGLE_FULLSCREEN: 'f',     // F - Toggle fullscreen
  ADD_SURFACE: 'a',           // A - Add new surface
  DELETE_SURFACE: 'Delete',   // Delete - Remove selected surface
  TOGGLE_SIDEBAR: 's'         // S - Toggle sidebar visibility
};
```

**Customization**: To change shortcuts, modify these values

---

#### Storage Keys

```javascript
export const STORAGE_KEYS = {
  SURFACES: 'projection_mapping_surfaces',    // Surface configurations
  APP_STATE: 'projection_mapping_app_state'   // App state (mode, etc.)
};
```

**Usage**: localStorage keys for persistence
**Warning**: Changing these will invalidate existing saved data

---

#### Rendering Constants

```javascript
export const GRID_SIZE = 8;                   // Grid pattern: 8x8 cells
export const GEOMETRY_SUBDIVISIONS = 20;      // PlaneGeometry subdivisions
```

**GRID_SIZE**:
- Controls checkerboard and grid pattern resolution
- Higher = more squares but smaller numbers
- Range: 4-16 recommended

**GEOMETRY_SUBDIVISIONS**:
- Controls mesh subdivision for smooth warping
- Higher = smoother perspective transform but more vertices
- Range: 10-50 recommended
- Default: 20 (good balance)
- Performance impact: High subdivision = more calculations

---

#### Default Surface Configuration

```javascript
export const DEFAULT_SURFACE_CONFIG = {
  name: 'Surface',
  contentType: CONTENT_TYPES.CHECKERBOARD,
  geometryType: GEOMETRY_TYPES.POLYGON,
  cornerCount: 4,              // Number of corners (3-8)
  visible: true,
  renderOrder: 0,
  audioReactive: false
};
```

**Usage**: Default values when creating new surface

---

## Vite Configuration

### Location: `vite.config.js`

```javascript
export default defineConfig({
  server: {
    port: 3000,    // Dev server port
    open: true     // Auto-open browser
  },
  build: {
    outDir: 'dist',          // Build output directory
    assetsDir: 'assets'      // Static assets subdirectory
  }
});
```

**Tunable Parameters**:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `server.port` | 3000 | Development server port |
| `server.open` | true | Auto-open browser on start |
| `build.outDir` | 'dist' | Production build directory |
| `build.assetsDir` | 'assets' | Static assets folder |

---

## Three.js / R3F Configuration

### Canvas Settings

**Location**: `src/features/scene/components/Scene.jsx`

```jsx
<Canvas
  camera={{ position: [0, 0, 5], fov: 75 }}
  gl={{
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true  // Required for screenshots
  }}
>
```

**Tunable Parameters**:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `camera.position` | [0, 0, 5] | Camera position in 3D space |
| `camera.fov` | 75 | Field of view (degrees) |
| `gl.antialias` | true | Enable antialiasing (smoother edges) |
| `gl.alpha` | true | Transparent background |
| `gl.preserveDrawingBuffer` | true | Enable screenshot capability |

**Performance Tips**:
- Disable `antialias` for better performance on low-end hardware
- Lower `fov` for less perspective distortion

---

### Material Base Properties

**Location**: `src/features/scene/components/Surface.jsx`

```javascript
const baseProps = {
  side: THREE.DoubleSide,  // Render both sides
  depthTest: false,        // Disable depth testing
  depthWrite: false        // Disable depth writing
};
```

**Why these settings**:
- `DoubleSide`: Surface visible from front and back
- `depthTest: false`: Surfaces don't occlude each other
- `depthWrite: false`: Render order controlled by `renderOrder` prop

---

## Shader Uniforms

### Common Shader Parameters

All shader materials receive these uniforms:

```javascript
{
  time: 0,              // Elapsed time (seconds)
  resolution: [w, h]    // Viewport resolution
}
```

### Audio-Reactive Shader Uniforms

```javascript
{
  time: 0,
  audioAmplitude: 0,    // Overall volume (0-1)
  audioBass: 0,         // Bass frequencies (0-1)
  audioMid: 0,          // Mid frequencies (0-1)
  audioTreble: 0,       // Treble frequencies (0-1)
  audioFrequency: 0     // Dominant frequency (Hz)
}
```

**Location**: Updated in `Surface.jsx` useFrame hook

---

## Corner Positioning

### Default Corner Calculation

**Location**: `src/shared/utils/constants.js` - `getDefaultCorners()`

```javascript
const centerX = width / 2;
const centerY = height / 2;
const radius = Math.min(width, height) * 0.25;  // 25% of viewport
```

**Tunable Parameters**:
- `radius`: Controls initial surface size
  - Current: 0.25 (25% of viewport)
  - Increase for larger default surfaces
  - Decrease for smaller default surfaces

**Corner Count**:
- Min: 3 (triangle)
- Max: 8 (octagon)
- Default: 4 (quadrilateral)

---

## Audio Analysis Configuration

### Location: `src/shared/context/AudioContext.jsx`

```javascript
const FFT_SIZE = 2048;           // FFT resolution
const SMOOTHING = 0.8;           // Frequency smoothing (0-1)
const MIN_DECIBELS = -90;        // Minimum dB
const MAX_DECIBELS = -10;        // Maximum dB
```

**Tunable Parameters**:

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| `FFT_SIZE` | 2048 | 32-32768 | Frequency resolution (higher = more detail) |
| `SMOOTHING` | 0.8 | 0-1 | Smoothing factor (higher = smoother but slower) |
| `MIN_DECIBELS` | -90 | -100 to 0 | Minimum volume threshold |
| `MAX_DECIBELS` | -10 | -100 to 0 | Maximum volume threshold |

**Performance Note**: Higher FFT_SIZE = better frequency resolution but more CPU usage

---

## BroadcastChannel Configuration

### Location: `src/shared/utils/broadcastChannel.js`

```javascript
const CHANNEL_NAME = 'projection-mapping-sync';

export const MessageTypes = {
  MODE_CHANGED: 'MODE_CHANGED',
  SURFACE_UPDATED: 'SURFACE_UPDATED',
  SURFACES_UPDATED: 'SURFACES_UPDATED'
};
```

**Tunable Parameters**:
- `CHANNEL_NAME`: Must be unique per application
- `MessageTypes`: Define cross-tab message types

---

## Future Configuration (TypeScript Migration)

### Planned: Environment Variables

```typescript
// .env (to be created)
VITE_API_ENDPOINT=http://localhost:3000
VITE_MAX_SURFACES=20
VITE_ENABLE_ANALYTICS=false
```

**Access in code**:
```typescript
const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
```

### Planned: Runtime Configuration

```typescript
// config/runtime.ts (to be created)
export const RuntimeConfig = {
  performance: {
    maxSurfaces: 20,
    targetFPS: 60,
    enableStats: false
  },
  features: {
    audioReactive: true,
    customShaders: true
  }
};
```

---

## Configuration Validation (Future with Zod)

### Planned Schema Validation

```typescript
import { z } from 'zod';

const SurfaceConfigSchema = z.object({
  name: z.string().min(1).max(50),
  contentType: z.enum([/* content types */]),
  geometryType: z.enum(['polygon']),
  cornerCount: z.number().int().min(3).max(8),
  visible: z.boolean(),
  renderOrder: z.number().int(),
  audioReactive: z.boolean()
});

// Validate at runtime
const validateSurfaceConfig = (config: unknown) => {
  return SurfaceConfigSchema.parse(config);
};
```

---

## Performance Tuning Guide

### Low-End Hardware Optimizations

```javascript
// Reduce geometry subdivisions
export const GEOMETRY_SUBDIVISIONS = 10;  // Instead of 20

// Disable antialiasing
<Canvas gl={{ antialias: false }}>

// Limit max surfaces
const MAX_SURFACES = 5;  // Instead of unlimited
```

### High-End Hardware Optimizations

```javascript
// Increase subdivisions for smoother transforms
export const GEOMETRY_SUBDIVISIONS = 50;

// Higher FFT resolution for audio
const FFT_SIZE = 4096;

// Enable shadows (currently disabled)
<Canvas shadows>
```

---

## Summary

### Most Frequently Tuned Parameters

1. **GEOMETRY_SUBDIVISIONS** (20) - Affects transform smoothness and performance
2. **GRID_SIZE** (8) - Pattern resolution
3. **FFT_SIZE** (2048) - Audio analysis resolution
4. **Default corner radius** (0.25) - Initial surface size

### Critical Constants (Don't Change)

1. **STORAGE_KEYS** - Changing invalidates saved data
2. **APP_MODES** - Core application states
3. **GEOMETRY_TYPES** - Would require implementation changes

### Safe to Customize

1. **KEYBOARD_SHORTCUTS** - Personal preference
2. **DEFAULT_SURFACE_CONFIG** - Workflow preference
3. **Vite server.port** - Development environment
4. **Audio analysis parameters** - Audio quality preference
