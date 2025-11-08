import * as THREE from 'three';
import { GEOMETRY_TYPES } from '../../../shared/utils/constants';

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
  static applyTransformToGeometry(geometry, corners, geometryType = GEOMETRY_TYPES.RECTANGLE) {
    const positions = geometry.attributes.position;

    // Get the original positions (before any transformation)
    if (!geometry.userData.originalPositions) {
      geometry.userData.originalPositions = positions.array.slice();
    }

    const originalPositions = geometry.userData.originalPositions;

    // Choose transformation based on geometry type
    let transform;
    switch (geometryType) {
      case GEOMETRY_TYPES.RECTANGLE:
        transform = this.calculateHomography(corners);
        break;
      case GEOMETRY_TYPES.TRIANGLE:
        transform = this.calculateTriangleTransform(corners);
        break;
      case GEOMETRY_TYPES.CIRCLE:
      case GEOMETRY_TYPES.CUSTOM:
        transform = this.calculatePolygonTransform(corners);
        break;
      default:
        transform = this.calculateHomography(corners);
    }

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
   * Calculate transformation for triangle geometry
   * @param {Object} corners - Triangle corner positions (point0, point1, point2)
   * @returns {Function} Transform function
   */
  static calculateTriangleTransform(corners) {
    const p0 = {
      x: this.normalizeX(corners.point0.x),
      y: this.normalizeY(corners.point0.y)
    };
    const p1 = {
      x: this.normalizeX(corners.point1.x),
      y: this.normalizeY(corners.point1.y)
    };
    const p2 = {
      x: this.normalizeX(corners.point2.x),
      y: this.normalizeY(corners.point2.y)
    };

    return {
      transform: (x, y) => {
        // Map from triangle in normalized space to target triangle
        // Original triangle vertices in normalized space:
        // Top: (0, 1), Bottom-left: (-0.866, -0.5), Bottom-right: (0.866, -0.5)

        // Calculate barycentric coordinates
        const denom = (-0.866 - 0) * (-0.5 - 1) - (0.866 - 0) * (-0.5 - 1);
        const w0 = ((0.866 - 0) * (y - 1) - (0 - 0) * (x - 0)) / denom;
        const w1 = ((0 - 0.866) * (y - 1) - (0 - 0) * (x - 0.866)) / denom;
        const w2 = 1 - w0 - w1;

        // Interpolate to target positions
        const resultX = p0.x * w2 + p1.x * w0 + p2.x * w1;
        const resultY = p0.y * w2 + p1.y * w0 + p2.y * w1;

        return [resultX, resultY];
      }
    };
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
