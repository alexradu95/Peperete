import * as THREE from 'three';
import { GEOMETRY_TYPES } from '../../../shared/utils/constants';

/**
 * GeometryGenerator - Creates different types of geometries based on type
 */
export class GeometryGenerator {
  /**
   * Create geometry based on geometry type
   * @param {string} geometryType - Type of geometry (rectangle, triangle, circle, custom)
   * @param {number} cornerCount - Number of corners for custom geometry
   * @param {number} subdivisions - Number of subdivisions for the geometry
   * @returns {THREE.BufferGeometry} - The generated geometry
   */
  static createGeometry(geometryType, cornerCount = 4, subdivisions = 20) {
    switch (geometryType) {
      case GEOMETRY_TYPES.RECTANGLE:
        return this.createRectangleGeometry(subdivisions);

      case GEOMETRY_TYPES.TRIANGLE:
        return this.createTriangleGeometry(subdivisions);

      case GEOMETRY_TYPES.CIRCLE:
        return this.createCircleGeometry(8, subdivisions);

      case GEOMETRY_TYPES.CUSTOM:
        return this.createPolygonGeometry(cornerCount, subdivisions);

      default:
        return this.createRectangleGeometry(subdivisions);
    }
  }

  /**
   * Create a subdivided rectangle geometry
   */
  static createRectangleGeometry(subdivisions) {
    return new THREE.PlaneGeometry(2, 2, subdivisions, subdivisions);
  }

  /**
   * Create a subdivided triangle geometry
   */
  static createTriangleGeometry(subdivisions) {
    // Create a triangle using a custom geometry
    const geometry = new THREE.BufferGeometry();

    // Triangle vertices in normalized space (-1 to 1)
    const vertices = [];
    const indices = [];

    // Generate subdivided triangle
    const steps = subdivisions + 1;

    for (let i = 0; i <= subdivisions; i++) {
      const v = i / subdivisions; // 0 to 1 from top to bottom

      // Number of vertices in this row
      const numInRow = i + 1;

      for (let j = 0; j < numInRow; j++) {
        const u = numInRow > 1 ? j / (numInRow - 1) : 0.5; // 0 to 1 from left to right

        // Barycentric interpolation for triangle
        // Top vertex: (0, 1)
        // Bottom-left: (-0.866, -0.5)
        // Bottom-right: (0.866, -0.5)
        const x = -0.866 + u * 1.732 * (1 - v);
        const y = 1 - v * 1.5;

        vertices.push(x, y, 0);
      }
    }

    // Generate triangle indices
    let vertexIndex = 0;
    for (let i = 0; i < subdivisions; i++) {
      const numInRow = i + 1;
      const numInNextRow = i + 2;

      for (let j = 0; j < numInRow; j++) {
        // First triangle
        indices.push(vertexIndex + j);
        indices.push(vertexIndex + numInRow + j);
        indices.push(vertexIndex + numInRow + j + 1);

        // Second triangle (if not at the edge)
        if (j < numInRow - 1) {
          indices.push(vertexIndex + j);
          indices.push(vertexIndex + numInRow + j + 1);
          indices.push(vertexIndex + j + 1);
        }
      }

      vertexIndex += numInRow;
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }

  /**
   * Create a subdivided circle geometry using control points
   */
  static createCircleGeometry(segments = 8, subdivisions = 20) {
    return new THREE.CircleGeometry(1, segments * subdivisions);
  }

  /**
   * Create a custom polygon geometry with specified number of sides
   */
  static createPolygonGeometry(sides, subdivisions) {
    if (sides < 3) sides = 3;
    if (sides > 8) sides = 8;

    // For polygons, we'll create a circle-like geometry
    return new THREE.CircleGeometry(1, sides * subdivisions);
  }

  /**
   * Get corner count for a geometry type
   */
  static getCornerCount(geometryType, customCornerCount = 4) {
    switch (geometryType) {
      case GEOMETRY_TYPES.RECTANGLE:
        return 4;
      case GEOMETRY_TYPES.TRIANGLE:
        return 3;
      case GEOMETRY_TYPES.CIRCLE:
        return 8;
      case GEOMETRY_TYPES.CUSTOM:
        return Math.min(8, Math.max(3, customCornerCount));
      default:
        return 4;
    }
  }

  /**
   * Get corner keys for a surface based on geometry type
   */
  static getCornerKeys(geometryType, cornerCount = 4) {
    switch (geometryType) {
      case GEOMETRY_TYPES.RECTANGLE:
        return ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

      case GEOMETRY_TYPES.TRIANGLE:
        return ['point0', 'point1', 'point2'];

      case GEOMETRY_TYPES.CIRCLE:
        return Array.from({ length: 8 }, (_, i) => `point${i}`);

      case GEOMETRY_TYPES.CUSTOM:
        return Array.from({ length: cornerCount }, (_, i) => `point${i}`);

      default:
        return ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
    }
  }
}
