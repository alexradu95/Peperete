import { CornerPoint } from './CornerPoint.js';
import { TransformCalculator } from './TransformCalculator.js';
import { GUI } from 'lil-gui';

/**
 * CalibrationManager - Manages calibration mode and corner points
 */
export class CalibrationManager {
  constructor(surfaceManager) {
    this.surfaceManager = surfaceManager;
    this.cornerPoints = {};
    this.isActive = false;
    this.gui = null;
    this.guiControllers = {};

    // Current corners (from selected surface)
    this.corners = TransformCalculator.getDefaultCorners();
  }

  /**
   * Enable calibration mode
   */
  enableCalibration() {
    if (this.isActive) return;

    this.isActive = true;

    // Load corners from selected surface
    this.loadCornersFromSelectedSurface();

    // Create corner points
    this.createCornerPoints();

    // Create GUI controls
    this.createGUI();

    // Show calibration overlay
    const overlay = document.getElementById('calibration-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      overlay.classList.add('fade-enter');
    }

    // Update status indicator
    const statusIndicator = document.getElementById('status-indicator');
    if (statusIndicator) {
      statusIndicator.classList.add('calibration');
    }

    console.log('Calibration mode enabled');
  }

  /**
   * Disable calibration mode
   */
  disableCalibration() {
    if (!this.isActive) return;

    this.isActive = false;

    // Remove corner points
    this.removeCornerPoints();

    // Remove GUI
    if (this.gui) {
      this.gui.destroy();
      this.gui = null;
    }

    // Hide calibration overlay
    const overlay = document.getElementById('calibration-overlay');
    if (overlay) {
      overlay.classList.remove('fade-enter');
      overlay.classList.add('fade-exit');
      setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.classList.remove('fade-exit');
      }, 300);
    }

    // Update status indicator
    const statusIndicator = document.getElementById('status-indicator');
    if (statusIndicator) {
      statusIndicator.classList.remove('calibration');
    }

    console.log('Calibration mode disabled');
  }

  /**
   * Create the 4 corner points
   */
  createCornerPoints() {
    const onChange = (id, position) => this.onCornerDrag(id, position);

    this.cornerPoints.topLeft = new CornerPoint(
      'topLeft',
      'TL',
      this.corners.topLeft.x,
      this.corners.topLeft.y,
      onChange
    );

    this.cornerPoints.topRight = new CornerPoint(
      'topRight',
      'TR',
      this.corners.topRight.x,
      this.corners.topRight.y,
      onChange
    );

    this.cornerPoints.bottomLeft = new CornerPoint(
      'bottomLeft',
      'BL',
      this.corners.bottomLeft.x,
      this.corners.bottomLeft.y,
      onChange
    );

    this.cornerPoints.bottomRight = new CornerPoint(
      'bottomRight',
      'BR',
      this.corners.bottomRight.x,
      this.corners.bottomRight.y,
      onChange
    );
  }

  /**
   * Remove corner points
   */
  removeCornerPoints() {
    Object.values(this.cornerPoints).forEach(point => point.dispose());
    this.cornerPoints = {};
  }

  /**
   * Handle corner drag event
   */
  onCornerDrag(pointId, position) {
    // Update corner position
    this.corners[pointId] = position;

    // Update GUI if exists
    this.updateGUIValues(pointId);

    // Apply transformation to projection quad
    this.updateTransformation();
  }

  /**
   * Update the perspective transformation
   */
  updateTransformation() {
    const selectedSurface = this.surfaceManager.getSelectedSurface();
    if (selectedSurface) {
      selectedSurface.updateCorners(this.corners);
    }
  }

  /**
   * Load corners from the currently selected surface
   */
  loadCornersFromSelectedSurface() {
    const selectedSurface = this.surfaceManager.getSelectedSurface();
    if (selectedSurface) {
      this.corners = { ...selectedSurface.corners };
    } else {
      this.corners = TransformCalculator.getDefaultCorners();
    }
  }

  /**
   * Switch to a different surface
   */
  switchSurface(surfaceId) {
    // Select the surface
    this.surfaceManager.selectSurface(surfaceId);

    // Load its corners
    this.loadCornersFromSelectedSurface();

    // Update corner points if in calibration mode
    if (this.isActive) {
      // Update visual corner positions
      Object.keys(this.cornerPoints).forEach(key => {
        const point = this.cornerPoints[key];
        if (point && this.corners[key]) {
          point.setPosition(this.corners[key].x, this.corners[key].y);
        }
      });

      // Update GUI - recreate it to ensure proper binding
      if (this.gui) {
        this.gui.destroy();
        this.gui = null;
      }
      this.createGUI();
    }

    console.log(`Switched to surface ${surfaceId} for calibration`);
  }

  /**
   * Create lil-gui controls
   */
  createGUI() {
    this.gui = new GUI({ title: 'Calibration Controls' });

    // Top Left
    const tlFolder = this.gui.addFolder('Top Left');
    this.guiControllers.tlX = tlFolder.add(this.corners.topLeft, 'x', 0, window.innerWidth).onChange((value) => {
      this.cornerPoints.topLeft.setPosition(value, this.corners.topLeft.y);
      this.updateTransformation();
    });
    this.guiControllers.tlY = tlFolder.add(this.corners.topLeft, 'y', 0, window.innerHeight).onChange((value) => {
      this.cornerPoints.topLeft.setPosition(this.corners.topLeft.x, value);
      this.updateTransformation();
    });

    // Top Right
    const trFolder = this.gui.addFolder('Top Right');
    this.guiControllers.trX = trFolder.add(this.corners.topRight, 'x', 0, window.innerWidth).onChange((value) => {
      this.cornerPoints.topRight.setPosition(value, this.corners.topRight.y);
      this.updateTransformation();
    });
    this.guiControllers.trY = trFolder.add(this.corners.topRight, 'y', 0, window.innerHeight).onChange((value) => {
      this.cornerPoints.topRight.setPosition(this.corners.topRight.x, value);
      this.updateTransformation();
    });

    // Bottom Left
    const blFolder = this.gui.addFolder('Bottom Left');
    this.guiControllers.blX = blFolder.add(this.corners.bottomLeft, 'x', 0, window.innerWidth).onChange((value) => {
      this.cornerPoints.bottomLeft.setPosition(value, this.corners.bottomLeft.y);
      this.updateTransformation();
    });
    this.guiControllers.blY = blFolder.add(this.corners.bottomLeft, 'y', 0, window.innerHeight).onChange((value) => {
      this.cornerPoints.bottomLeft.setPosition(this.corners.bottomLeft.x, value);
      this.updateTransformation();
    });

    // Bottom Right
    const brFolder = this.gui.addFolder('Bottom Right');
    this.guiControllers.brX = brFolder.add(this.corners.bottomRight, 'x', 0, window.innerWidth).onChange((value) => {
      this.cornerPoints.bottomRight.setPosition(value, this.corners.bottomRight.y);
      this.updateTransformation();
    });
    this.guiControllers.brY = brFolder.add(this.corners.bottomRight, 'y', 0, window.innerHeight).onChange((value) => {
      this.cornerPoints.bottomRight.setPosition(this.corners.bottomRight.x, value);
      this.updateTransformation();
    });
  }

  /**
   * Update GUI values when corners are dragged
   */
  updateGUIValues(pointId) {
    if (!this.gui) return;

    const prefix = pointId.replace('topLeft', 'tl')
                          .replace('topRight', 'tr')
                          .replace('bottomLeft', 'bl')
                          .replace('bottomRight', 'br');

    const xKey = `${prefix}X`;
    const yKey = `${prefix}Y`;

    if (this.guiControllers[xKey]) {
      this.guiControllers[xKey].updateDisplay();
    }
    if (this.guiControllers[yKey]) {
      this.guiControllers[yKey].updateDisplay();
    }
  }

  /**
   * Get current calibration data
   */
  getCalibrationData() {
    return {
      corners: { ...this.corners }
    };
  }

  /**
   * Load calibration data
   */
  loadCalibrationData(data) {
    if (!data || !data.corners) return;

    if (TransformCalculator.validateCorners(data.corners)) {
      this.corners = { ...data.corners };

      // Update corner points if in calibration mode
      if (this.isActive) {
        Object.keys(this.cornerPoints).forEach(key => {
          const point = this.cornerPoints[key];
          point.setPosition(this.corners[key].x, this.corners[key].y);
        });

        // Update GUI values
        Object.keys(this.corners).forEach(key => {
          this.updateGUIValues(key);
        });
      }

      // Apply transformation
      this.updateTransformation();

      console.log('Calibration data loaded');
    }
  }

  /**
   * Reset to default corners
   */
  reset() {
    this.corners = TransformCalculator.getDefaultCorners();

    // Update corner points if active
    if (this.isActive) {
      Object.keys(this.cornerPoints).forEach(key => {
        const point = this.cornerPoints[key];
        point.setPosition(this.corners[key].x, this.corners[key].y);
      });

      // Update GUI
      Object.keys(this.corners).forEach(key => {
        this.updateGUIValues(key);
      });
    }

    // Apply transformation
    this.updateTransformation();

    console.log('Calibration reset to defaults');
  }
}
