# Multi-Surface Projection Mapping Application

A web-based projection mapping application built with Three.js that allows you to project visual content onto **multiple** square/rectangular architectural surfaces using manual corner-pinning calibration. Each surface can have its own texture/content and independent calibration.

## Features

- **Multiple Surfaces**: Create, manage, and calibrate multiple projection surfaces simultaneously
- **Per-Surface Content**: Assign different textures/animations to each surface independently
- **Z-Axis Priority Control**: Control rendering order when surfaces overlap
- **Manual Corner-Pinning Calibration**: Drag 4 corner points to align each surface with physical architecture
- **Real-time Perspective Transformation**: Uses bilinear interpolation for accurate warping
- **Surface Management UI**: Interactive panel to add, remove, select, and configure surfaces
- **Multiple Content Types**: Test patterns, animated gradients, solid colors, images, and more
- **Calibration Persistence**: Save and load all surfaces and their calibrations using localStorage
- **Fullscreen Support**: Project directly to external displays/projectors
- **GUI Controls**: Fine-tune corner positions with lil-gui controls
- **Keyboard Shortcuts**: Quick access to all features

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Usage

### Getting Started

1. Open the application in your browser (http://localhost:3000)
2. You'll see the **Surfaces panel** on the left with one default surface
3. Click **"+ Add Surface"** to create additional projection surfaces
4. Click on a surface in the panel to select it
5. Press **C** to enter calibration mode
6. Drag the corner points (TL, TR, BL, BR) to align with your physical projection surface
7. Press **S** to save all surface calibrations
8. Press **C** again to return to playback mode

### Managing Multiple Surfaces

Each surface can be configured independently:

- **Select a surface**: Click on it in the Surfaces panel
- **Add a surface**: Click the "+ Add Surface" button
- **Toggle visibility**: Click the eye icon (👁/🚫) to show/hide a surface
- **Adjust render priority**: Click ▲ to move forward (render on top), ▼ to move backward
- **Change content**: Click the palette icon (🎨) to select content for that surface
- **Delete a surface**: Click the trash icon (🗑) to remove it
- **Calibrate**: Select a surface and press C to adjust its corner points

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `C` | Toggle Calibration Mode |
| `F` | Toggle Fullscreen |
| `S` | Save All Surfaces |
| `L` | Load Surfaces |
| `R` | Reset Current Surface |
| `[` | Move Surface Backward (Lower Priority) |
| `]` | Move Surface Forward (Higher Priority) |
| `ESC` | Exit Fullscreen/Calibration |

### Console Commands

The application exposes an `app` object to the browser console for advanced control:

```javascript
// Add a new surface
app.addSurface("My Wall")
app.addSurface("Floor Projection")

// Remove a surface (use ID from Surfaces panel)
app.removeSurface(1)

// Select a surface for calibration
app.selectSurface(2)

// Load content for a specific surface
app.loadContentForSurface(1, "checkerboard")
app.loadContentForSurface(2, "animated-gradient")
app.loadContentForSurface(3, "grid")

// Load content for currently selected surface
app.loadContent("rotating-colors")
app.loadContent("white")
app.loadContent("red")
app.loadContent("image", {url: "path/to/image.jpg"})

// Get all surfaces
app.surfaceManager.getAllSurfaces()

// Toggle surface visibility programmatically
app.surfaceManager.toggleSurfaceVisibility(1)
```

## Calibration Tips

1. **Use the Grid Pattern**: The numbered grid pattern is ideal for initial calibration as it clearly shows distortion
2. **Start with Corners**: Align the red corner markers (TL, TR, BL, BR) first
3. **Fine-tune with GUI**: Use the lil-gui panel for precise adjustments
4. **Test with Different Content**: After calibration, try different content types to verify alignment
5. **Save Your Work**: Always save calibration after making changes (saves ALL surfaces)
6. **Work One Surface at a Time**: Select a surface, calibrate it, then move to the next
7. **Hide Surfaces**: Toggle visibility to focus on calibrating one surface without interference
8. **Different Content Per Surface**: Assign different textures to easily identify each surface
9. **Adjust Z-Priority**: Use `[` and `]` keys or ▲▼ buttons to control which surface renders on top when they overlap

## Multi-Surface Use Cases

- **Multiple Walls**: Project different content on different walls simultaneously
- **Floor + Wall**: Combine floor projections with wall projections
- **Architectural Features**: Map individual surfaces like columns, arches, or panels
- **Interactive Installations**: Create multi-zone interactive experiences
- **Video Walls**: Combine multiple projection quads for a larger canvas

## Project Structure

```
projection-mapping/
├── src/
│   ├── main.js                 # Application entry point
│   ├── app.js                  # Main application controller
│   ├── calibration/
│   │   ├── CalibrationManager.js    # Calibration mode logic (multi-surface)
│   │   ├── CornerPoint.js           # Corner point drag handler
│   │   └── TransformCalculator.js   # Bilinear interpolation calculations
│   ├── renderer/
│   │   ├── SceneManager.js          # Three.js scene setup
│   │   ├── SurfaceManager.js        # Manages multiple surfaces
│   │   ├── Surface.js               # Individual surface class
│   │   └── ContentManager.js        # Content/material creation
│   ├── utils/
│   │   ├── StorageManager.js        # localStorage operations
│   │   ├── KeyboardHandler.js       # Keyboard shortcuts
│   │   └── SurfaceUI.js             # Surface management UI
│   └── styles/
│       ├── main.css                 # Global styles + surface panel
│       └── calibration.css          # Calibration UI styles
├── public/
│   └── assets/                 # Textures, videos, models
├── index.html
├── package.json
└── vite.config.js
```

## Technical Details

### Dependencies

- **Three.js** (r160+): 3D rendering engine
- **Vite**: Build tool and dev server
- **perspective-transform**: Homography matrix calculations
- **lil-gui**: GUI controls for calibration

### Camera Setup

The application uses an orthographic camera for 2D projection output, ensuring no additional perspective distortion.

### Transformation Pipeline

1. User drags corner points in calibration mode
2. TransformCalculator computes homography matrix using perspective-transform library
3. Matrix is applied to projection quad vertices (20x20 subdivisions)
4. Three.js renders the transformed geometry

### Calibration Storage

Calibration data is stored in localStorage with the following schema:

```javascript
{
  timestamp: "2025-11-08T...",
  corners: {
    topLeft: {x, y},
    topRight: {x, y},
    bottomLeft: {x, y},
    bottomRight: {x, y}
  },
  resolution: {width, height}
}
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+ (limited fullscreen API support)

Requires:
- WebGL 2.0
- Fullscreen API
- LocalStorage
- ES6 Modules

## Development

### Adding New Content Types

To add a new content type, extend the `ContentManager` class:

```javascript
// In ContentManager.js
loadMyCustomContent() {
  const material = new THREE.MeshBasicMaterial({...});
  this.projectionQuad.material = material;
  this.currentContent = 'my-custom-content';
}
```

Then load it via:
```javascript
app.loadContent("my-custom-content")
```

### Debugging

- Open browser console to see initialization logs
- Corner positions are logged during calibration
- Use `app` object for runtime inspection
- GUI panel shows exact corner coordinates

## Performance

- Target: 60 FPS
- Optimized vertex updates during calibration
- Efficient render loop with requestAnimationFrame
- Geometry updates only when corners move

## License

MIT

## Credits

Built with [Three.js](https://threejs.org/), [Vite](https://vitejs.dev/), and [lil-gui](https://lil-gui.georgealways.com/).
