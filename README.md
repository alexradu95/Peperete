# Projection Mapping - React Three Fiber

A modular projection mapping application built with React Three Fiber, designed for parallel development by multiple teams.

## Architecture Overview

This application follows a **feature-based modular architecture** that allows multiple developers to work independently on different features without conflicts.

### Technology Stack

- **React** - UI framework
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **@use-gesture/react** - Gesture handling for calibration
- **Three.js** - 3D graphics library
- **lil-gui** - Calibration controls
- **Vite** - Build tool

## Project Structure

```
src/
├── features/                       # Feature modules (isolated, parallel-dev friendly)
│   ├── scene/                     # 3D Scene feature
│   │   ├── components/
│   │   │   ├── Scene.jsx          # Main R3F canvas
│   │   │   └── Surface.jsx        # Individual surface component
│   │   ├── hooks/
│   │   │   └── useContentManager.js # Material creation
│   │   ├── materials/
│   │   │   ├── AnimatedGradientMaterial.jsx
│   │   │   └── RotatingColorsMaterial.jsx
│   │   └── index.js               # Public API
│   │
│   ├── surface-manager/           # Surface state management
│   │   ├── context/
│   │   │   └── SurfaceContext.jsx # Global surface state
│   │   └── index.js
│   │
│   ├── calibration/               # Calibration feature
│   │   ├── components/
│   │   │   ├── CalibrationMode.jsx
│   │   │   └── CornerPoint.jsx    # Draggable corners
│   │   ├── utils/
│   │   │   └── TransformCalculator.js # Perspective math
│   │   └── index.js
│   │
│   └── ui/                        # UI components
│       ├── components/
│       │   ├── SurfacePanel.jsx   # Left sidebar
│       │   ├── StatusBar.jsx      # Bottom bar
│       │   └── Notification.jsx   # Toast notifications
│       └── index.js
│
├── shared/                        # Shared utilities
│   ├── context/
│   │   └── AppContext.jsx         # Global app state
│   ├── hooks/
│   │   ├── useKeyboard.js         # Keyboard shortcuts
│   │   └── useStorage.js          # localStorage persistence
│   ├── utils/
│   │   └── constants.js           # App constants
│   └── index.js
│
├── App.jsx                        # Main app component
└── main.jsx                       # React entry point
```

## Feature Modules

Each feature module is **self-contained** with:
- ✅ Components (UI/3D)
- ✅ Hooks (business logic)
- ✅ Utils (helpers)
- ✅ Context (if needed)
- ✅ Barrel export (`index.js`) for clean imports

### Example: Using a Feature Module

```jsx
// Import from feature module's public API
import { Scene, Surface } from './features/scene';
import { CalibrationMode } from './features/calibration';
import { SurfacePanel } from './features/ui';
```

## Developing in Parallel

### Team Assignment Examples

**Team A - Scene Rendering:**
- Work in `src/features/scene/`
- Add new materials, shaders, effects
- No conflicts with other teams

**Team B - Calibration:**
- Work in `src/features/calibration/`
- Improve corner dragging, add presets
- Independent development

**Team C - UI/UX:**
- Work in `src/features/ui/`
- Add new panels, improve styling
- Isolated CSS files

**Team D - Surface Management:**
- Work in `src/features/surface-manager/`
- Add grouping, templates, export/import
- State management isolated

### Best Practices for Parallel Development

1. **Feature Branches**: Each team works on their own feature module
   ```bash
   git checkout -b feature/scene-improvements
   git checkout -b feature/calibration-presets
   ```

2. **Barrel Exports**: Only export what's needed via `index.js`
   ```js
   // features/scene/index.js
   export { Scene } from './components/Scene';
   export { Surface } from './components/Surface';
   // Don't export internal helpers
   ```

3. **Shared Constants**: Use `src/shared/utils/constants.js` for shared values
   ```js
   import { CONTENT_TYPES } from '../../../shared/utils/constants';
   ```

4. **Component Composition**: Build small, reusable components
   ```jsx
   // Good - small, focused
   function CornerPoint({ position, onDrag }) { ... }

   // Avoid - large, monolithic
   function CalibrationSystemWithEverything() { ... }
   ```

5. **CSS Modules**: Each component has its own CSS file
   ```
   SurfacePanel.jsx
   SurfacePanel.css  ← Scoped styles
   ```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Build

```bash
npm run build
```

Output in `dist/` folder.

## Features

### Surface Management
- Add/remove multiple projection surfaces
- Configure content type (checkerboard, grid, colors, gradients, images)
- Adjust render order (z-index)
- Toggle visibility

### Calibration Mode
- Drag corner points to align with physical projection surface
- Fine-tune with lil-gui controls
- Perspective transformation using bilinear interpolation
- Real-time preview

### Playback Mode
- Clean projection output
- No UI overlays
- Fullscreen support

### Content Types
- ✅ Checkerboard pattern
- ✅ Grid with numbers
- ✅ Animated gradient (GLSL shader)
- ✅ Rotating colors (GLSL shader)
- ✅ Solid colors (white, red, green, blue)
- ✅ Custom images

### Keyboard Shortcuts
- `Space` - Toggle calibration/playback mode
- `F` - Toggle fullscreen
- `A` - Add new surface
- `Delete` - Remove selected surface

## Adding New Features

### Example: Add a New Material Type

1. **Create the material shader**:
   ```jsx
   // src/features/scene/materials/WaveMaterial.jsx
   import { shaderMaterial } from '@react-three/drei';

   const WaveShaderMaterial = shaderMaterial(
     { time: 0 },
     /* vertex shader */,
     /* fragment shader */
   );

   export default WaveShaderMaterial;
   ```

2. **Update constants**:
   ```js
   // src/shared/utils/constants.js
   export const CONTENT_TYPES = {
     // ... existing
     WAVE: 'wave'
   };
   ```

3. **Add to Surface component**:
   ```jsx
   // src/features/scene/components/Surface.jsx
   case CONTENT_TYPES.WAVE:
     return { type: 'wave', props: baseProps };
   ```

4. **Update UI**:
   ```jsx
   // src/features/ui/components/SurfacePanel.jsx
   <option value={CONTENT_TYPES.WAVE}>Wave Pattern</option>
   ```

### Example: Add a New Calibration Tool

1. **Create component**:
   ```jsx
   // src/features/calibration/components/GridOverlay.jsx
   export function GridOverlay() { ... }
   ```

2. **Use in CalibrationMode**:
   ```jsx
   // src/features/calibration/components/CalibrationMode.jsx
   import { GridOverlay } from './GridOverlay';

   // In render:
   <GridOverlay />
   ```

3. **Export from feature module**:
   ```js
   // src/features/calibration/index.js
   export { GridOverlay } from './components/GridOverlay';
   ```

## State Management

### Global State (Context API)

**App State** (`AppContext`):
- Current mode (calibration/playback)
- Fullscreen state
- Notifications

**Surface State** (`SurfaceContext`):
- All surfaces
- Selected surface
- CRUD operations
- Persists to localStorage

### Local State (Component State)

Each component manages its own UI state (form inputs, hover states, etc.)

## Performance Optimization

### React.memo for Components
```jsx
export const Surface = React.memo(({ surface }) => {
  // Component only re-renders if surface prop changes
});
```

### useMemo for Expensive Calculations
```jsx
const texture = useMemo(() => {
  return createComplexTexture();
}, [dependencies]);
```

### useFrame for Animations
```jsx
useFrame((state, delta) => {
  materialRef.current.uniforms.time.value += delta;
});
```

## Testing Strategy

### Component Testing
```bash
npm install --save-dev vitest @testing-library/react
```

Example test:
```jsx
import { render } from '@testing-library/react';
import { SurfacePanel } from './SurfacePanel';

test('renders surface panel', () => {
  const { getByText } = render(<SurfacePanel />);
  expect(getByText('Surfaces')).toBeInTheDocument();
});
```

## Migration Summary

### What Changed

| Before | After |
|--------|-------|
| Vanilla JS classes | React components |
| Manual DOM manipulation | Declarative JSX |
| Three.js direct API | React Three Fiber |
| Global event listeners | React hooks |
| Monolithic files | Feature modules |

### Lines of Code

- **Before**: ~1,936 LOC (vanilla JS)
- **After**: ~2,500+ LOC (React + modular structure)
- **Benefit**: Better organization, easier testing, parallel development

## Troubleshooting

### Build Warnings
The build may show warnings about chunk size. This is normal and can be optimized later with code splitting:

```js
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei']
        }
      }
    }
  }
};
```

### Hot Reload Issues
If changes don't reflect, try:
```bash
rm -rf node_modules/.vite
npm run dev
```

## Contributing

1. Choose a feature module to work on
2. Create a feature branch
3. Make changes within your feature module
4. Test locally
5. Submit PR with clear description
6. Minimal conflicts with other teams!

## License

MIT

## Credits

Built with [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/), [Three.js](https://threejs.org/), [Vite](https://vitejs.dev/), and [lil-gui](https://lil-gui.georgealways.com/).
