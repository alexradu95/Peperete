# Surface Transformation Features

This document describes the newly implemented whole-surface transformation functionality.

## Overview

Surfaces can now be transformed as a whole unit using **Move**, **Rotate**, and **Scale** operations, in addition to the original individual corner manipulation.

## Transformation Modes

### 1. Corners Mode (Original)
- **Icon**: ⬡
- **Description**: Individual corner manipulation
- **Usage**: Drag individual corner points to adjust the surface shape
- **Best for**: Fine-tuning perspective warping and keystone correction

### 2. Move Mode
- **Icon**: ✥
- **Description**: Translate the entire surface
- **Usage**: Click and drag anywhere on the screen to move all corners together
- **Keyboard**: Click and drag to move the surface
- **GUI Controls**:
  - X Offset slider (-100 to 100px)
  - Y Offset slider (-100 to 100px)
  - Apply Move button
- **Best for**: Repositioning surfaces without changing shape

### 3. Rotate Mode
- **Icon**: ↻
- **Description**: Rotate surface around its center
- **Usage**: Click and drag to rotate the surface around its geometric center
- **Visual Feedback**: Blue circle indicator shows the rotation center
- **GUI Controls**:
  - Angle slider (-180° to 180°)
  - Apply Rotation button
- **Best for**: Aligning surfaces with rotated projection surfaces

### 4. Scale Mode
- **Icon**: ⇲
- **Description**: Uniformly or non-uniformly scale the surface
- **Usage**: Drag away from center to enlarge, toward center to shrink
- **Visual Feedback**: Blue circle indicator shows the scale center
- **GUI Controls**:
  - Uniform Scale checkbox (linked X/Y scaling)
  - Scale X slider (0.1x to 3x)
  - Scale Y slider (0.1x to 3x)
  - Apply Scale button
- **Best for**: Resizing surfaces while maintaining proportions

## User Interface

### Mode Selection
A button group appears in the top-left corner of the calibration overlay with four buttons:
- **Corners** - Individual corner manipulation
- **Move** - Whole surface translation
- **Rotate** - Rotation around center
- **Scale** - Scaling from center

Click any button to switch between transformation modes.

### GUI Panel (lil-gui)
Located in the top-right corner, the GUI panel contains:

1. **Transform Folder** (new)
   - **Move** subfolder with numeric controls
   - **Rotate** subfolder with angle control
   - **Scale** subfolder with scale factor controls

2. **Corners Folder** (original)
   - Individual corner X/Y position sliders
   - One folder per corner point

### Visual Feedback

#### Corner Mode
- Red circular handles at each corner
- Corner labels (TL, TR, BL, BR or 1, 2, 3...)
- Draggable corner points

#### Move/Rotate/Scale Modes
- Semi-transparent colored overlay:
  - **Move**: Blue tint
  - **Rotate**: Orange tint
  - **Scale**: Purple tint
- Center indicator (Rotate/Scale only): Blue circle showing transformation pivot
- Custom cursor for each mode:
  - **Move**: Move cursor (↔)
  - **Rotate**: Grab cursor (✋)
  - **Scale**: Resize cursor (⇲)

### Instructions
Dynamic instructions appear at the top center of the screen:
- **Corners**: "Drag the corner points to align the surface with your projection area"
- **Move**: "Click and drag anywhere to move the entire surface"
- **Rotate**: "Click and drag to rotate the surface around its center"
- **Scale**: "Drag away from or toward the center to scale the surface"

## Implementation Details

### New Files Created

1. **SurfaceTransformations.js**
   - Location: `/src/features/calibration/utils/SurfaceTransformations.js`
   - Utility functions for surface transformations:
     - `moveSurface(corners, dx, dy)` - Translate all corners
     - `rotateSurface(corners, angleRadians, pivot)` - Rotate around pivot
     - `scaleSurface(corners, scaleX, scaleY, pivot)` - Scale from pivot
     - `calculateSurfaceCenter(corners)` - Calculate geometric center
     - `getSurfaceBounds(corners)` - Get bounding box
     - `isPointInsideSurface(point, corners)` - Point-in-polygon test
   - Constants: `TRANSFORM_MODES` enum

2. **TransformModeSelector.jsx**
   - Location: `/src/features/calibration/components/TransformModeSelector.jsx`
   - React component for mode selection UI
   - Button group with icons and labels

3. **TransformModeSelector.module.css**
   - Location: `/src/features/calibration/components/TransformModeSelector.module.css`
   - Styles for the mode selector component

### Modified Files

1. **CalibrationMode.jsx**
   - Added transformation mode state management
   - Integrated `useDrag` hook for whole-surface manipulation
   - Added mode-specific drag handlers
   - Updated GUI to include transformation controls
   - Conditional rendering based on active mode
   - Center indicator visualization

2. **CalibrationMode.css**
   - Added styles for transform mode selector positioning
   - Added styles for surface transform area overlays
   - Color-coded backgrounds for different modes

## Technical Notes

### Coordinate System
- Screen coordinates: pixels from top-left (0, 0)
- All transformations preserve the corner naming scheme (point0, point1, etc.)
- Rotation/scale pivot defaults to geometric center of all corners

### Transformation Mathematics

#### Move
```javascript
newCorner = { x: corner.x + dx, y: corner.y + dy }
```

#### Rotate
```javascript
// Translate to origin
x' = corner.x - center.x
y' = corner.y - center.y

// Rotate
x'' = x' * cos(θ) - y' * sin(θ)
y'' = x' * sin(θ) + y' * cos(θ)

// Translate back
newCorner = { x: x'' + center.x, y: y'' + center.y }
```

#### Scale
```javascript
// Translate to origin
x' = corner.x - center.x
y' = corner.y - center.y

// Scale
x'' = x' * scaleX
y'' = y' * scaleY

// Translate back
newCorner = { x: x'' + center.x, y: y'' + center.y }
```

### State Management
- Transformation state stored in `transformStateRef` to maintain initial values during drag
- Initial corners captured on first drag event
- Center/angle/distance calculated once and reused during drag gesture
- Final corners committed to `SurfaceContext` on every update

### Gesture Handling
- Uses `@use-gesture/react` library for drag detection
- Touch-action disabled to prevent scrolling during drag
- Offset-based for Move mode (cumulative translation)
- Position-based for Rotate/Scale modes (relative to center)

## Usage Examples

### Example 1: Repositioning a Surface
1. Select surface from left panel
2. Enter Calibration Mode (Space key)
3. Click **Move** button in mode selector
4. Click and drag anywhere to reposition
5. Fine-tune with GUI numeric controls if needed

### Example 2: Rotating for Alignment
1. Select surface
2. Enter Calibration Mode
3. Click **Rotate** button
4. Drag to rotate around the blue center indicator
5. Or use GUI angle slider for precise rotation (e.g., 45°, 90°)

### Example 3: Scaling to Fit
1. Select surface
2. Enter Calibration Mode
3. Click **Scale** button
4. Drag away from center to enlarge, toward to shrink
5. Or use GUI Scale X/Y sliders
6. Toggle "Uniform Scale" for aspect-ratio-preserving scaling

### Example 4: Complex Transformations
1. Use **Move** to position roughly
2. Switch to **Rotate** to align orientation
3. Switch to **Scale** to adjust size
4. Switch to **Corners** for final perspective correction

## Browser Compatibility
- Tested on modern browsers (Chrome, Firefox, Safari, Edge)
- Touch gestures supported on tablets/touchscreens
- Requires ES6+ support

## Performance Considerations
- Transformations are applied in real-time during drag
- Geometry recalculation happens on every corner update
- No performance issues observed with 3-8 corner polygons
- Subdivision count (20 segments per corner) optimized for smooth curves

## Future Enhancements (Potential)
- Keyboard shortcuts (e.g., M for Move, R for Rotate, S for Scale)
- Snap-to-grid for precise positioning
- Undo/redo for transformations
- Copy/paste transformations between surfaces
- Animation/interpolation between transformation states
- Constraint modes (e.g., horizontal-only move, 45° rotation snapping)
