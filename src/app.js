import { SceneManager } from './renderer/SceneManager.js';
import { SurfaceManager } from './renderer/SurfaceManager.js';
import { ContentManager } from './renderer/ContentManager.js';
import { CalibrationManager } from './calibration/CalibrationManager.js';
import { KeyboardHandler } from './utils/KeyboardHandler.js';
import { StorageManager } from './utils/StorageManager.js';
import { SurfaceUI } from './utils/SurfaceUI.js';

/**
 * App - Main application controller with multi-surface support
 */
export class App {
  constructor() {
    this.sceneManager = null;
    this.surfaceManager = null;
    this.contentManager = null;
    this.calibrationManager = null;
    this.keyboardHandler = null;
    this.surfaceUI = null;

    this.state = {
      mode: 'playback', // 'calibration' or 'playback'
      isFullscreen: false
    };

    this.lastTime = 0;
  }

  /**
   * Initialize the application
   */
  init() {
    console.log('Initializing Multi-Surface Projection Mapping Application...');

    // Get container
    const container = document.getElementById('canvas-container');

    // Initialize scene manager
    this.sceneManager = new SceneManager(container);
    this.sceneManager.init();

    // Initialize surface manager
    this.surfaceManager = new SurfaceManager(this.sceneManager.getScene());

    // Initialize content manager
    this.contentManager = new ContentManager(null); // We'll use it differently now

    // Initialize calibration manager
    this.calibrationManager = new CalibrationManager(this.surfaceManager);

    // Initialize surface UI
    this.surfaceUI = new SurfaceUI(this.surfaceManager, this);

    // Initialize keyboard handler
    this.keyboardHandler = new KeyboardHandler(this);

    // Try to load saved surfaces
    this.loadSurfaces();

    // If no surfaces, create a complex example setup
    if (this.surfaceManager.getAllSurfaces().length === 0) {
      this.createComplexExample();
    }

    // Start render loop
    this.lastTime = performance.now();
    this.animate();

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', () => {
      this.state.isFullscreen = !!document.fullscreenElement;
    });

    // Store previous window size for resize scaling
    this.windowSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Listen for window resize to scale corner positions
    window.addEventListener('resize', () => this.handleResize());

    console.log('Application initialized successfully');
    console.log('Press C to toggle calibration mode');
  }

  /**
   * Animation loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();
  }

  /**
   * Update logic
   */
  update(deltaTime) {
    // Update content animations for all surfaces
    if (this.state.mode === 'playback') {
      this.surfaceManager.getAllSurfaces().forEach(surface => {
        if (surface.mesh && surface.mesh.material && surface.mesh.material.uniforms) {
          // Update shader time uniform if it exists
          if (surface.mesh.material.uniforms.time) {
            surface.mesh.material.uniforms.time.value += deltaTime;
          }
        }
      });
    }
  }

  /**
   * Render scene
   */
  render() {
    this.sceneManager.render();
  }

  /**
   * Add a new surface
   */
  addSurface(name = null) {
    const surface = this.surfaceManager.addSurface(name);

    // Set default content
    this.loadContentForSurface(surface.id, 'grid');

    // Update UI
    this.surfaceUI.render();

    this.showNotification(`Added: ${surface.name}`);
    return surface;
  }

  /**
   * Remove a surface
   */
  removeSurface(surfaceId) {
    const surface = this.surfaceManager.getSurface(surfaceId);
    if (!surface) return;

    const name = surface.name;
    this.surfaceManager.removeSurface(surfaceId);
    this.surfaceUI.render();
    this.showNotification(`Removed: ${name}`);
  }

  /**
   * Select a surface for calibration
   */
  selectSurface(surfaceId) {
    console.log(`App: Selecting surface ${surfaceId}`);

    // Select in surface manager
    const surface = this.surfaceManager.selectSurface(surfaceId);

    if (!surface) {
      console.warn(`Surface ${surfaceId} not found`);
      return;
    }

    // Update calibration manager
    this.calibrationManager.switchSurface(surfaceId);

    // Update UI
    this.surfaceUI.render();
    this.surfaceUI.updateCurrentSurfaceName();

    console.log(`Selected: ${surface.name} (ID: ${surfaceId})`);
  }

  /**
   * Load content for a specific surface
   */
  loadContentForSurface(surfaceId, contentType, options = {}) {
    const surface = this.surfaceManager.getSurface(surfaceId);
    if (!surface) return;

    let material;

    switch (contentType) {
      case 'checkerboard':
        material = this.contentManager.createCheckerboardMaterial();
        break;
      case 'grid':
        material = this.contentManager.createGridMaterial();
        break;
      case 'animated-gradient':
        material = this.contentManager.createAnimatedGradientMaterial();
        break;
      case 'rotating-colors':
        material = this.contentManager.createRotatingColorsMaterial();
        break;
      case 'white':
        material = this.contentManager.createSolidColorMaterial(0xffffff);
        break;
      case 'red':
        material = this.contentManager.createSolidColorMaterial(0xff0000);
        break;
      case 'green':
        material = this.contentManager.createSolidColorMaterial(0x00ff00);
        break;
      case 'blue':
        material = this.contentManager.createSolidColorMaterial(0x0000ff);
        break;
      case 'image':
        if (options.url) {
          this.contentManager.loadImageMaterial(options.url, (material) => {
            surface.setMaterial(material);
          });
          return;
        }
        break;
      default:
        console.warn('Unknown content type:', contentType);
        return;
    }

    if (material) {
      surface.setMaterial(material);
      console.log(`Loaded ${contentType} for ${surface.name}`);
    }
  }

  /**
   * Switch to calibration mode
   */
  switchToCalibrationMode() {
    if (this.state.mode === 'calibration') return;

    this.state.mode = 'calibration';
    this.calibrationManager.enableCalibration();
    this.surfaceUI.updateCurrentSurfaceName();

    console.log('Switched to CALIBRATION mode');
  }

  /**
   * Switch to playback mode
   */
  switchToPlaybackMode() {
    if (this.state.mode === 'playback') return;

    this.state.mode = 'playback';
    this.calibrationManager.disableCalibration();

    console.log('Switched to PLAYBACK mode');
  }

  /**
   * Toggle calibration mode
   */
  toggleCalibrationMode() {
    if (this.state.mode === 'calibration') {
      this.switchToPlaybackMode();
    } else {
      this.switchToCalibrationMode();
    }
  }

  /**
   * Toggle fullscreen
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Failed to enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * Save all surfaces to localStorage
   */
  saveCalibration() {
    const surfaceData = this.surfaceManager.getAllCalibrationData();
    const success = StorageManager.saveSurfaces(surfaceData);

    if (success) {
      this.showNotification('All surfaces saved!');
    } else {
      this.showNotification('Failed to save surfaces', 'error');
    }
  }

  /**
   * Load surfaces from localStorage
   */
  loadSurfaces() {
    const data = StorageManager.loadSurfaces();

    if (data) {
      this.surfaceManager.loadAllCalibrationData(data);

      // Reload content for each surface (content isn't saved, so use defaults)
      this.surfaceManager.getAllSurfaces().forEach(surface => {
        this.loadContentForSurface(surface.id, 'grid');
      });

      this.surfaceUI.render();
      this.showNotification('Surfaces loaded!');
    }
  }

  /**
   * Reset calibration for current surface
   */
  resetCalibration() {
    this.calibrationManager.reset();
    this.showNotification('Calibration reset for current surface');
  }

  /**
   * Move selected surface up in the list (increase priority)
   */
  moveSelectedSurfaceUp() {
    const surface = this.surfaceManager.getSelectedSurface();
    if (surface) {
      const moved = this.surfaceManager.moveSurfaceUp(surface.id);
      if (moved) {
        this.surfaceUI.render();
        this.showNotification(`${surface.name} moved up (priority: ${surface.priority})`);
      }
    }
  }

  /**
   * Move selected surface down in the list (decrease priority)
   */
  moveSelectedSurfaceDown() {
    const surface = this.surfaceManager.getSelectedSurface();
    if (surface) {
      const moved = this.surfaceManager.moveSurfaceDown(surface.id);
      if (moved) {
        this.surfaceUI.render();
        this.showNotification(`${surface.name} moved down (priority: ${surface.priority})`);
      }
    }
  }

  /**
   * Create a complex example setup with multiple surfaces
   */
  createComplexExample() {
    console.log('Creating complex example setup...');

    // Create 4 surfaces with different content
    const surface1 = this.addSurface('Background Grid');
    this.loadContentForSurface(surface1.id, 'grid');

    const surface2 = this.addSurface('Animated Gradient');
    this.loadContentForSurface(surface2.id, 'animated-gradient');

    const surface3 = this.addSurface('Rotating Colors');
    this.loadContentForSurface(surface3.id, 'rotating-colors');

    const surface4 = this.addSurface('Front Checkerboard');
    this.loadContentForSurface(surface4.id, 'checkerboard');

    // Get canvas dimensions for accurate pixel-based positioning
    const canvas = document.querySelector('canvas');
    const w = canvas ? canvas.clientWidth : window.innerWidth;
    const h = canvas ? canvas.clientHeight : window.innerHeight;
    const margin = 50;

    // Set initial corner positions for each surface to create interesting layout
    // Surface 1: Top-left quadrant
    surface1.updateCorners({
      topLeft: { x: margin, y: margin },
      topRight: { x: w * 0.45, y: margin },
      bottomLeft: { x: margin, y: h * 0.45 },
      bottomRight: { x: w * 0.45, y: h * 0.45 }
    });

    // Surface 2: Top-right quadrant
    surface2.updateCorners({
      topLeft: { x: w * 0.55, y: margin },
      topRight: { x: w - margin, y: margin },
      bottomLeft: { x: w * 0.55, y: h * 0.45 },
      bottomRight: { x: w - margin, y: h * 0.45 }
    });

    // Surface 3: Bottom-left quadrant
    surface3.updateCorners({
      topLeft: { x: margin, y: h * 0.55 },
      topRight: { x: w * 0.45, y: h * 0.55 },
      bottomLeft: { x: margin, y: h - margin },
      bottomRight: { x: w * 0.45, y: h - margin }
    });

    // Surface 4: Center overlapping (smaller)
    surface4.updateCorners({
      topLeft: { x: w * 0.35, y: h * 0.35 },
      topRight: { x: w * 0.65, y: h * 0.35 },
      bottomLeft: { x: w * 0.35, y: h * 0.65 },
      bottomRight: { x: w * 0.65, y: h * 0.65 }
    });

    // Select the first surface
    this.selectSurface(surface1.id);

    console.log('Complex example created: 4 surfaces with different content and layouts');
    this.showNotification('Complex example loaded! Press C to calibrate');
  }

  /**
   * Show notification message
   */
  showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background-color: ${type === 'error' ? '#ff4444' : '#00ffff'};
      color: ${type === 'error' ? '#fff' : '#000'};
      padding: 10px 20px;
      border-radius: 5px;
      font-weight: bold;
      z-index: 10000;
      animation: fadeIn 0.3s ease-in;
    `;

    document.body.appendChild(notification);

    // Remove after 2 seconds
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 2000);
  }

  /**
   * Handle window resize - scale all surface corners proportionally
   */
  handleResize() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    // Calculate scale factors
    const scaleX = newWidth / this.windowSize.width;
    const scaleY = newHeight / this.windowSize.height;

    // Scale all surface corners
    this.surfaceManager.getAllSurfaces().forEach(surface => {
      const oldCorners = surface.corners;
      const newCorners = {
        topLeft: {
          x: oldCorners.topLeft.x * scaleX,
          y: oldCorners.topLeft.y * scaleY
        },
        topRight: {
          x: oldCorners.topRight.x * scaleX,
          y: oldCorners.topRight.y * scaleY
        },
        bottomLeft: {
          x: oldCorners.bottomLeft.x * scaleX,
          y: oldCorners.bottomLeft.y * scaleY
        },
        bottomRight: {
          x: oldCorners.bottomRight.x * scaleX,
          y: oldCorners.bottomRight.y * scaleY
        }
      };

      surface.updateCorners(newCorners);
    });

    // Update stored window size
    this.windowSize.width = newWidth;
    this.windowSize.height = newHeight;

    // Update calibration UI if active
    if (this.state.mode === 'calibration') {
      this.calibrationManager.loadCornersFromSelectedSurface();
      // Update corner point positions
      Object.keys(this.calibrationManager.cornerPoints).forEach(key => {
        const point = this.calibrationManager.cornerPoints[key];
        const corners = this.calibrationManager.corners;
        if (point && corners[key]) {
          point.setPosition(corners[key].x, corners[key].y);
        }
      });
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  loadContent(type, options = {}) {
    const selectedSurface = this.surfaceManager.getSelectedSurface();
    if (selectedSurface) {
      this.loadContentForSurface(selectedSurface.id, type, options);
    } else {
      console.warn('No surface selected');
    }
  }
}
