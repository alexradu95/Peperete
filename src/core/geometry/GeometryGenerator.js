import * as THREE from 'three';

/**
 * GeometryGenerator - Creates different types of geometries based on type
 *
 * Moved from features/scene/utils to core/geometry for shared access
 */
export class GeometryGenerator {
  /**
   * Create geometry based on corner count
   * @param {string} geometryType - Type of geometry (always 'polygon' now)
   * @param {number} cornerCount - Number of corners (3-8)
   * @param {number} subdivisions - Number of subdivisions for the geometry
   * @returns {THREE.BufferGeometry} - The generated geometry
   */
  static createGeometry(geometryType, cornerCount = 4, subdivisions = 20) {
    return this.createPolygonGeometry(cornerCount, subdivisions);
  }

  /**
   * Create a polygon geometry with specified number of corners
   * Uses CircleGeometry for smooth subdivision
   */
  static createPolygonGeometry(cornerCount, subdivisions) {
    const corners = Math.min(8, Math.max(3, cornerCount));

    // Use CircleGeometry which provides good UV mapping and subdivision
    // The number of radial segments determines the smoothness
    const segments = corners * subdivisions;
    return new THREE.CircleGeometry(1, segments);
  }

  /**
   * Get corner count for a geometry type
   */
  static getCornerCount(geometryType, customCornerCount = 4) {
    return Math.min(8, Math.max(3, customCornerCount));
  }

  /**
   * Get corner keys for a surface based on corner count
   */
  static getCornerKeys(geometryType, cornerCount = 4) {
    const count = Math.min(8, Math.max(3, cornerCount));
    return Array.from({ length: count }, (_, i) => `point${i}`);
  }
}
