/**
 * KeyboardHandler - Manages keyboard shortcuts for the application
 */
export class KeyboardHandler {
  constructor(app) {
    this.app = app;
    this.handlers = new Map();
    this.init();
  }

  /**
   * Initialize keyboard event listeners
   */
  init() {
    // Define key bindings
    this.handlers.set('c', () => this.app.toggleCalibrationMode());
    this.handlers.set('f', () => this.app.toggleFullscreen());
    this.handlers.set('s', () => this.app.saveCalibration());
    this.handlers.set('l', () => this.app.loadCalibration());
    this.handlers.set('r', () => this.app.resetCalibration());
    this.handlers.set('Escape', () => this.handleEscape());

    // Surface reordering controls
    this.handlers.set('[', () => this.app.moveSelectedSurfaceUp());
    this.handlers.set(']', () => this.app.moveSelectedSurfaceDown());

    // Add event listener
    window.addEventListener('keydown', (e) => this.onKeyDown(e));

    console.log('Keyboard shortcuts initialized');
  }

  /**
   * Handle keydown events
   */
  onKeyDown(event) {
    const key = event.key;

    // Check if handler exists for this key
    if (this.handlers.has(key)) {
      event.preventDefault();
      const handler = this.handlers.get(key);
      handler();
    }
  }

  /**
   * Handle Escape key
   */
  handleEscape() {
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (this.app.state.mode === 'calibration') {
      // Exit calibration mode
      this.app.switchToPlaybackMode();
    }
  }

  /**
   * Remove event listeners
   */
  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
  }
}
