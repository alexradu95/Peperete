import * as THREE from 'three';
import { GEOMETRY_TYPES } from '../../../shared/utils/constants';

/**
 * TransformCalculator - Calculates and applies perspective transformations
 */
export class TransformCalculator {

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
   * Normalize X coordinate to -1 to 1 range (accounting for aspect ratio)
   * The orthographic camera uses aspect ratio, so the plane only fills the vertical dimension
   * We need to scale X coordinates to match this
   */
  static normalizeX(x) {
    const dims = this.getCanvasDimensions();
    const aspect = dims.width / dims.height;

    // The camera frustum is from -aspect to +aspect in X
    // But we want to map canvas pixels (0 to width) to this range
    // First normalize to 0-1, then scale to match aspect ratio
    const normalized = x / dims.width;  // 0 to 1
    return (normalized * 2 - 1) * aspect;  // -aspect to +aspect
  }

  /**
   * Normalize Y coordinate to -1 to 1 range (inverted for WebGL)
   */
  static normalizeY(y) {
    const dims = this.getCanvasDimensions();
    // Y goes from -1 to 1 (fills full height)
    return -((y / dims.height) * 2 - 1);
  }

  /**
   * Apply perspective transformation to projection geometry
   * @param {THREE.BufferGeometry} geometry - The geometry to transform
   * @param {Object} corners - Corner positions
   * @param {string} geometryType - Type of geometry
   */
  static applyTransformToGeometry(geometry, corners, geometryType = GEOMETRY_TYPES.POLYGON) {
    const positions = geometry.attributes.position;

    // Get the original positions (before any transformation)
    if (!geometry.userData.originalPositions) {
      geometry.userData.originalPositions = positions.array.slice();
    }

    const originalPositions = geometry.userData.originalPositions;

    // Use polygon transformation for all geometry types
    const transform = this.calculatePolygonTransform(corners);

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
   * Calculate transformation for polygon/circle geometry
   * @param {Object} corners - Polygon corner positions (point0, point1, ...)
   * @returns {Function} Transform function
   */
  static calculatePolygonTransform(corners) {
    // Sort corner keys to ensure proper order (point0, point1, point2, ...)
    const sortedKeys = Object.keys(corners).sort((a, b) => {
      const aNum = parseInt(a.replace('point', ''));
      const bNum = parseInt(b.replace('point', ''));
      return aNum - bNum;
    });

    // Normalize all corner positions in sorted order
    const normalizedCorners = sortedKeys.map(key => ({
      x: this.normalizeX(corners[key].x),
      y: this.normalizeY(corners[key].y)
    }));

    const numPoints = normalizedCorners.length;

    return {
      transform: (x, y) => {
        // For polygon/circle, use radial interpolation
        const angle = Math.atan2(y, x);
        const radius = Math.sqrt(x * x + y * y);

        // Normalize angle to 0-1 range
        const normalizedAngle = (angle + Math.PI) / (Math.PI * 2);

        // Find the two closest control points
        let segmentIndex = Math.floor(normalizedAngle * numPoints);

        // Ensure segment index is within bounds
        segmentIndex = Math.max(0, Math.min(numPoints - 1, segmentIndex));
        const nextIndex = (segmentIndex + 1) % numPoints;

        // Interpolation factor within segment
        const t = (normalizedAngle * numPoints) - segmentIndex;

        // Get the two control points with safety checks
        const p1 = normalizedCorners[segmentIndex];
        const p2 = normalizedCorners[nextIndex];

        // Safety check
        if (!p1 || !p2) {
          return [x, y];
        }

        // Interpolate target positions
        const targetX = p1.x * (1 - t) + p2.x * t;
        const targetY = p1.y * (1 - t) + p2.y * t;

        // Scale by the actual vertex radius
        return [targetX * radius, targetY * radius];
      }
    };
  }

}
