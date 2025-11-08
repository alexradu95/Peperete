import { App } from './app.js';

/**
 * Main entry point
 */

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Create and initialize the application
  const app = new App();
  app.init();

  // Expose app to window for debugging and console access
  window.app = app;

  // Log available commands
  console.log('%c=== Multi-Surface Projection Mapping ===', 'color: #00ffff; font-size: 16px; font-weight: bold;');
  console.log('%cKeyboard Shortcuts:', 'color: #00ffff; font-weight: bold;');
  console.log('  C - Toggle Calibration Mode');
  console.log('  F - Toggle Fullscreen');
  console.log('  S - Save All Surfaces');
  console.log('  L - Load Surfaces');
  console.log('  R - Reset Current Surface');
  console.log('  [ - Move Surface Backward (Lower Priority)');
  console.log('  ] - Move Surface Forward (Higher Priority)');
  console.log('  ESC - Exit Fullscreen/Calibration');
  console.log('');
  console.log('%cConsole Commands:', 'color: #00ffff; font-weight: bold;');
  console.log('  app.addSurface("My Surface") - Add a new surface');
  console.log('  app.removeSurface(surfaceId) - Remove a surface');
  console.log('  app.selectSurface(surfaceId) - Select a surface for calibration');
  console.log('  app.loadContentForSurface(surfaceId, "grid") - Load content for specific surface');
  console.log('  app.loadContent("checkerboard") - Load content for current surface');
  console.log('');
  console.log('%cAvailable Content Types:', 'color: #ffaa00; font-weight: bold;');
  console.log('  "checkerboard", "grid", "animated-gradient", "rotating-colors"');
  console.log('  "white", "red", "green", "blue"');
  console.log('');
  console.log('%cTip: Use the Surfaces panel (left) to manage surfaces!', 'color: #ffff00;');
  console.log('%cTip: Press C to enter calibration mode and drag the corner points!', 'color: #ffff00;');
}
