import { describe, it, expect } from 'vitest';
import { GeometryGenerator } from './GeometryGenerator';
import { GEOMETRY_TYPES } from '../../shared/constants';

describe('GeometryGenerator', () => {
  describe('createGeometry', () => {
    it('should create polygon geometry with default parameters', () => {
      const geometry = GeometryGenerator.createGeometry(GEOMETRY_TYPES.POLYGON);

      expect(geometry).toBeDefined();
      expect(geometry.type).toBe('CircleGeometry');
    });

    it('should create geometry with custom corner count', () => {
      const geometry = GeometryGenerator.createGeometry(GEOMETRY_TYPES.POLYGON, 6, 20);

      expect(geometry).toBeDefined();
      // 6 corners * 20 subdivisions = 120 segments
      expect(geometry.parameters.segments).toBe(120);
    });

    it('should create geometry with different subdivision count', () => {
      const geometry = GeometryGenerator.createGeometry(GEOMETRY_TYPES.POLYGON, 4, 10);

      expect(geometry).toBeDefined();
      // 4 corners * 10 subdivisions = 40 segments
      expect(geometry.parameters.segments).toBe(40);
    });
  });

  describe('createPolygonGeometry', () => {
    it('should create geometry with 4 corners', () => {
      const geometry = GeometryGenerator.createPolygonGeometry(4, 20);

      expect(geometry).toBeDefined();
      expect(geometry.type).toBe('CircleGeometry');
      expect(geometry.parameters.segments).toBe(80); // 4 * 20
    });

    it('should clamp corner count to minimum of 3', () => {
      const geometry = GeometryGenerator.createPolygonGeometry(2, 20);

      expect(geometry).toBeDefined();
      expect(geometry.parameters.segments).toBe(60); // 3 * 20 (clamped to 3)
    });

    it('should clamp corner count to maximum of 8', () => {
      const geometry = GeometryGenerator.createPolygonGeometry(10, 20);

      expect(geometry).toBeDefined();
      expect(geometry.parameters.segments).toBe(160); // 8 * 20 (clamped to 8)
    });
  });

  describe('getCornerKeys', () => {
    it('should return 4 corner keys for quad geometry', () => {
      const keys = GeometryGenerator.getCornerKeys(GEOMETRY_TYPES.POLYGON, 4);

      expect(keys).toHaveLength(4);
      expect(keys).toContain('point0');
      expect(keys).toContain('point1');
      expect(keys).toContain('point2');
      expect(keys).toContain('point3');
    });

    it('should return numbered keys for non-quad geometry', () => {
      const keys = GeometryGenerator.getCornerKeys(GEOMETRY_TYPES.POLYGON, 6);

      expect(keys).toHaveLength(6);
      expect(keys).toContain('point0');
      expect(keys).toContain('point1');
      expect(keys).toContain('point5');
    });

    it('should return 3 corner keys for triangle', () => {
      const keys = GeometryGenerator.getCornerKeys(GEOMETRY_TYPES.POLYGON, 3);

      expect(keys).toHaveLength(3);
      expect(keys).toContain('point0');
      expect(keys).toContain('point1');
      expect(keys).toContain('point2');
    });
  });
});
