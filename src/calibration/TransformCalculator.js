import * as THREE from 'three';

/**
 * TransformCalculator - Calculates and applies perspective transformations
 */
export class TransformCalculator {
  /**
   * Calculate bilinear interpolation transformation from corner points
   * This is a simplified approach that works well for rectangular surfaces
   * @param {Object} corners - Object containing topLeft, topRight, bottomLeft, bottomRight positions
   * @returns {Function} Transform function
   */
  static calculateHomography(corners) {
    // Normalize corner positions to -1 to 1 range
    const tl = {
      x: this.normalizeX(corners.topLeft.x),
      y: this.normalizeY(corners.topLeft.y)
    };
    const tr = {
      x: this.normalizeX(corners.topRight.x),
      y: this.normalizeY(corners.topRight.y)
    };
    const bl = {
      x: this.normalizeX(corners.bottomLeft.x),
      y: this.normalizeY(corners.bottomLeft.y)
    };
    const br = {
      x: this.normalizeX(corners.bottomRight.x),
      y: this.normalizeY(corners.bottomRight.y)
    };

    // Return bilinear interpolation function
    return {
      transform: (x, y) => {
        // Convert from -1,1 range to 0,1 range for interpolation
        const u = (x + 1) / 2;
        const v = (y + 1) / 2;

        // Bilinear interpolation
        const top = {
          x: tl.x * (1 - u) + tr.x * u,
          y: tl.y * (1 - u) + tr.y * u
        };
        const bottom = {
          x: bl.x * (1 - u) + br.x * u,
          y: bl.y * (1 - u) + br.y * u
        };

        const result = {
          x: top.x * (1 - v) + bottom.x * v,
          y: top.y * (1 - v) + bottom.y * v
        };

        return [result.x, result.y];
      }
    };
  }

  /**
   * Get canvas dimensions for accurate coordinate mapping
   */
  static getCanvasDimensions() {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height
      };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  /**
   * Normalize X coordinate to -1 to 1 range
   */
  static normalizeX(x) {
    const dims = this.getCanvasDimensions();
    return (x / dims.width) * 2 - 1;
  }

  /**
   * Normalize Y coordinate to -1 to 1 range (inverted for WebGL)
   */
  static normalizeY(y) {
    const dims = this.getCanvasDimensions();
    return -((y / dims.height) * 2 - 1);
  }

  /**
   * Apply perspective transformation to projection quad geometry
   * @param {THREE.PlaneGeometry} geometry - The plane geometry to transform
   * @param {Object} corners - Corner positions
   */
  static applyTransformToGeometry(geometry, corners) {
    const transform = this.calculateHomography(corners);
    const positions = geometry.attributes.position;

    // Get the original positions (before any transformation)
    if (!geometry.userData.originalPositions) {
      geometry.userData.originalPositions = positions.array.slice();
    }

    const originalPositions = geometry.userData.originalPositions;

    // Transform each vertex
    for (let i = 0; i < positions.count; i++) {
      const idx = i * 3;

      // Get original position
      const x = originalPositions[idx];
      const y = originalPositions[idx + 1];

      // Apply transformation
      const transformed = transform.transform(x, y);

      // Update position
      positions.array[idx] = transformed[0];
      positions.array[idx + 1] = transformed[1];
      // Z stays the same
    }

    positions.needsUpdate = true;
    geometry.computeBoundingSphere();
  }

  /**
   * Get default corner positions (aligned to screen edges with some margin)
   */
  static getDefaultCorners() {
    const dims = this.getCanvasDimensions();
    const margin = 100;
    return {
      topLeft: { x: margin, y: margin },
      topRight: { x: dims.width - margin, y: margin },
      bottomLeft: { x: margin, y: dims.height - margin },
      bottomRight: { x: dims.width - margin, y: dims.height - margin }
    };
  }

  /**
   * Validate corner positions
   */
  static validateCorners(corners) {
    const required = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
    for (const key of required) {
      if (!corners[key] || corners[key].x === undefined || corners[key].y === undefined) {
        return false;
      }
    }
    return true;
  }
}
