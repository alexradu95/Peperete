# Projection Mapping Application - Technical Specification

## Project Overview

A web-based projection mapping application using Three.js that allows users to project visual content onto square/rectangular architectural surfaces using a physical projector. The application features manual corner-pinning calibration and real-time content playback.

## Core Objectives

1. Create a Three.js application that outputs to a physical projector
2. Implement manual corner-pinning calibration system
3. Support square/rectangular architectural surfaces
4. Provide smooth transition between calibration and playback modes
5. Persist calibration settings

## Technical Stack

### Required Dependencies
- **Three.js** (r160+): 3D rendering engine
- **Vite**: Build tool and dev server
- **perspective-transform** or **gl-matrix**: Homography matrix calculations
- Optional: **dat.gui** or **lil-gui**: Additional calibration controls

### Technology Choices
- **Vanilla JavaScript/TypeScript**: Core application logic
- **HTML5 Canvas**: Rendering output
- **localStorage**: Calibration data persistence
- **CSS**: UI overlay styling

## Application Architecture

### High-Level Structure

```
┌─────────────────────────────────────────┐
│         Application Controller          │
│  - Mode Management (Calibration/Play)   │
│  - State Management                     │
└─────────────────────────────────────────┘
         ┌──────────┴──────────┐
         │                     │
┌────────▼────────┐   ┌────────▼────────┐
│  Calibration    │   │   Content       │
│   System        │   │   Renderer      │
│ - Corner Points │   │ - Three.js      │
│ - Transform     │   │ - Animations    │
│ - UI Overlay    │   │ - Effects       │
└─────────────────┘   └─────────────────┘
         │                     │
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────┐
         │  Projection Output  │
         │   (Fullscreen to    │
         │    Projector)       │
         └─────────────────────┘
```

## File Structure

```
project-mapping/
├── src/
│   ├── main.js                 # Application entry point
│   ├── app.js                  # Main application controller
│   ├── calibration/
│   │   ├── CalibrationManager.js    # Calibration mode logic
│   │   ├── CornerPoint.js           # Individual corner point handler
│   │   └── TransformCalculator.js   # Homography calculations
│   ├── renderer/
│   │   ├── SceneManager.js          # Three.js scene setup
│   │   ├── ProjectionRenderer.js    # Projection-specific rendering
│   │   └── ContentManager.js        # Content/animation management
│   ├── utils/
│   │   ├── StorageManager.js        # localStorage operations
│   │   └── KeyboardHandler.js       # Keyboard shortcuts
│   └── styles/
│       ├── main.css                 # Global styles
│       └── calibration.css          # Calibration UI styles
├── public/
│   └── assets/                 # Textures, videos, models
├── index.html
├── package.json
└── vite.config.js
```

## Core Components Specification

### 1. Application Controller (`app.js`)

**Responsibilities:**
- Initialize Three.js renderer
- Manage application state (calibration vs playback mode)
- Handle mode switching
- Coordinate between calibration and content systems

**Key Methods:**
```javascript
class App {
  constructor()
  init()
  switchToCalibrationMode()
  switchToPlaybackMode()
  toggleFullscreen()
  update()
  render()
}
```

**State Management:**
```javascript
{
  mode: 'calibration' | 'playback',
  calibrationData: {
    topLeft: {x, y},
    topRight: {x, y},
    bottomLeft: {x, y},
    bottomRight: {x, y}
  },
  isFullscreen: boolean
}
```

### 2. Calibration Manager (`CalibrationManager.js`)

**Responsibilities:**
- Create and manage 4 corner point handles
- Handle drag interactions
- Calculate transformation matrix from corner positions
- Visualize calibration grid/guides
- Save/load calibration settings

**Key Methods:**
```javascript
class CalibrationManager {
  constructor(renderer)
  createCornerPoints()
  enableCalibration()
  disableCalibration()
  onCornerDrag(pointId, x, y)
  calculateTransformMatrix()
  saveCalibration()
  loadCalibration()
  drawCalibrationGuides()
}
```

**Corner Point Structure:**
- Visual handle (draggable circle/square)
- Label (TL, TR, BL, BR)
- Drag event handlers
- Position constraints (within canvas bounds)

### 3. Corner Point (`CornerPoint.js`)

**Responsibilities:**
- Render individual corner point UI
- Handle mouse/touch drag events
- Emit position change events

**Properties:**
```javascript
{
  id: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight',
  position: {x, y},
  isDragging: boolean,
  element: HTMLElement,
  size: number (handle radius)
}
```

**Events:**
- `dragStart`
- `drag`
- `dragEnd`

### 4. Transform Calculator (`TransformCalculator.js`)

**Responsibilities:**
- Calculate homography matrix from 4 corner points
- Apply perspective transformation to projection quad
- Handle inverse transformations if needed

**Key Methods:**
```javascript
class TransformCalculator {
  static calculateHomography(srcPoints, dstPoints)
  static applyTransformToGeometry(geometry, matrix)
  static createProjectionMatrix(corners)
}
```

**Math Implementation:**
- Use perspective-transform library OR
- Implement manual homography calculation
- Convert to Three.js Matrix4 format

### 5. Scene Manager (`SceneManager.js`)

**Responsibilities:**
- Initialize Three.js scene, camera, renderer
- Create projection quad geometry
- Set up lighting (if needed)
- Handle window resize

**Setup:**
```javascript
class SceneManager {
  constructor(container)
  init()
  createProjectionQuad()
  createCamera()
  setupLights()
  resize()
  getScene()
  getCamera()
  getRenderer()
}
```

**Scene Configuration:**
- Orthographic camera for 2D projection output
- Projection quad: PlaneGeometry (1x1, subdivided for transformation)
- Background: Black (0x000000)

### 6. Content Manager (`ContentManager.js`)

**Responsibilities:**
- Load and manage visual content (textures, videos, animations)
- Create and update materials
- Handle animation loops
- Manage content transitions

**Content Types to Support:**
```javascript
{
  image: Load texture and apply to quad,
  video: VideoTexture support,
  animation: Shader-based effects,
  color: Solid color or gradients
}
```

**Key Methods:**
```javascript
class ContentManager {
  constructor(scene)
  loadContent(type, source)
  updateContent()
  createShaderMaterial()
  animate(deltaTime)
}
```

### 7. Storage Manager (`StorageManager.js`)

**Responsibilities:**
- Save calibration data to localStorage
- Load calibration data on startup
- Handle multiple calibration profiles (optional)

**Storage Schema:**
```javascript
{
  'projectionMapping_calibration': {
    timestamp: Date,
    corners: {
      topLeft: {x, y},
      topRight: {x, y},
      bottomLeft: {x, y},
      bottomRight: {x, y}
    },
    resolution: {width, height}
  }
}
```

### 8. Keyboard Handler (`KeyboardHandler.js`)

**Responsibilities:**
- Manage keyboard shortcuts
- Toggle between modes
- Fullscreen controls
- Save/load shortcuts

**Key Bindings:**
```javascript
{
  'c': Toggle calibration mode,
  'f': Toggle fullscreen,
  's': Save calibration,
  'l': Load calibration,
  'r': Reset calibration,
  'Escape': Exit fullscreen/calibration
}
```

## Implementation Workflow

### Phase 1: Basic Setup
1. Initialize Vite project
2. Install Three.js and dependencies
3. Create basic HTML structure
4. Set up Three.js renderer and scene
5. Create simple projection quad

### Phase 2: Calibration System
1. Implement CornerPoint component with drag functionality
2. Create CalibrationManager to coordinate 4 corners
3. Add visual guides (grid, borders)
4. Implement TransformCalculator for homography
5. Apply transformation to projection quad geometry

### Phase 3: Content System
1. Create ContentManager for basic textures
2. Implement simple test pattern (grid, checkerboard)
3. Add animated content (rotating colors, moving patterns)
4. Support image loading

### Phase 4: Mode Management
1. Implement mode switching (calibration ↔ playback)
2. Add keyboard shortcuts
3. Create UI overlays for each mode
4. Implement state management

### Phase 5: Persistence & Polish
1. Add StorageManager for calibration saving
2. Implement auto-load on startup
3. Add fullscreen functionality
4. Optimize performance
5. Add error handling

## Technical Implementation Details

### Projection Quad Setup

```javascript
// Create quad geometry
const geometry = new THREE.PlaneGeometry(2, 2, 20, 20);

// Initial position (fullscreen, no transformation)
const positions = geometry.attributes.position.array;

// Apply transformation matrix to vertices
// This will be updated by CalibrationManager
```

### Homography Transformation

**Approach 1: Using perspective-transform library**
```javascript
import PerspT from 'perspective-transform';

const srcCorners = [0, 0, 1, 0, 0, 1, 1, 1]; // normalized
const dstCorners = [x1, y1, x2, y2, x3, y3, x4, y4]; // user corners

const perspT = PerspT(srcCorners, dstCorners);
const transformed = perspT.transform(x, y);
```

**Approach 2: Manual implementation**
- Calculate 3x3 homography matrix from point correspondences
- Apply to each vertex of projection quad
- Update geometry.attributes.position.needsUpdate = true

### Camera Setup

```javascript
// Use orthographic camera for 2D projection
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
  -aspect, aspect, 1, -1, 0.1, 10
);
camera.position.z = 1;
```

### Fullscreen Implementation

```javascript
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    renderer.domElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// Request specific display (projector) - experimental
const displays = await window.getScreenDetails();
const projectorDisplay = displays.screens[1]; // Second display
renderer.domElement.requestFullscreen({ screen: projectorDisplay });
```

## UI/UX Specifications

### Calibration Mode UI

**Corner Handles:**
- Size: 20px radius circles
- Color: Bright cyan (#00FFFF) with white border
- Labels: TL, TR, BL, BR
- Hover state: Scale 1.2x, change to yellow
- Drag state: Opacity 0.7

**Calibration Grid:**
- Grid lines: White, 1px, opacity 0.3
- Grid spacing: 50px
- Center crosshair: Red, thicker lines

**Instructions Overlay:**
- Position: Top-center
- Background: Semi-transparent black
- Text: "CALIBRATION MODE - Drag corners to align with projection surface"
- Shortcuts: Display active keyboard shortcuts

### Playback Mode UI

**Minimal UI:**
- No visible UI elements during playback
- Status indicator (small dot in corner): Green = playing
- Optional FPS counter (debug mode)

### Transition Animation

- Fade between modes: 300ms
- Corner handles: Fade out/in with scale animation

## Performance Considerations

### Optimization Strategies

1. **Render Loop:**
   - Use `requestAnimationFrame`
   - Only render when needed in calibration mode
   - Continuous rendering in playback mode
   - Target 60 FPS

2. **Geometry Updates:**
   - Only update vertices when corners move
   - Debounce transformation calculations (100ms)
   - Use `geometry.computeBoundingSphere()` after updates

3. **Content Loading:**
   - Preload assets
   - Use compressed textures
   - Implement asset caching

4. **Memory Management:**
   - Dispose geometries and materials properly
   - Clean up event listeners on mode switch
   - Limit texture resolution based on projector specs

## Testing Strategy

### Manual Testing Checklist

**Calibration:**
- [ ] All 4 corners are draggable
- [ ] Corners stay within canvas bounds
- [ ] Transformation updates in real-time
- [ ] Calibration persists after refresh
- [ ] Reset functionality works

**Playback:**
- [ ] Content displays correctly
- [ ] Smooth animations (60 FPS)
- [ ] Fullscreen works on projector display
- [ ] Mode switching is seamless

**Edge Cases:**
- [ ] Extreme corner positions (very skewed)
- [ ] Window resize handling
- [ ] Multiple calibration saves/loads
- [ ] Keyboard shortcuts don't conflict

### Test Content Ideas

1. **Checkerboard pattern**: Verify alignment
2. **Grid with numbers**: Test corner accuracy
3. **Animated gradients**: Check smoothness
4. **Video playback**: Performance test
5. **White border**: Projection boundary test

## Browser Compatibility

**Target Support:**
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+ (limited fullscreen API)

**Required APIs:**
- WebGL 2.0
- Fullscreen API
- LocalStorage
- ES6 Modules

## Future Enhancements (Optional)

1. **Advanced Features:**
   - Multiple surface support
   - Edge blending for multi-projector setups
   - Bezier curve warping
   - Automatic calibration using camera/markers

2. **Content Features:**
   - Shader effect library
   - Real-time audio reactivity
   - Video playlist management
   - Integration with projection mapping software

3. **UI Improvements:**
   - Visual calibration preset library
   - Calibration accuracy indicators
   - Timeline-based content sequencing
   - Remote control via mobile device

## Deliverables Checklist

- [ ] Working application with calibration mode
- [ ] Playback mode with sample content
- [ ] Keyboard shortcuts implemented
- [ ] Calibration persistence
- [ ] Fullscreen support
- [ ] Basic documentation (README)
- [ ] Sample test patterns included

## Notes for Implementation

- Start with the simplest possible implementation
- Test calibration with printed grid patterns before using actual projector
- Keep transformation calculations separate from rendering loop
- Use debug overlays to visualize transformation matrix
- Implement graceful degradation if WebGL2 not available

## Getting Started Command

```bash
npm create vite@latest projection-mapping -- --template vanilla
cd projection-mapping
npm install three perspective-transform
npm run dev
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-08  
**Target Completion:** Implement Phase 1-4 for MVP
