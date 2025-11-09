import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDefaultCorners } from './constants';
import { GEOMETRY_TYPES } from './constants';

describe('getDefaultCorners', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    // Set up a known window size for consistent testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080
    });
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight
    });
  });

  describe('corner count behavior', () => {
    it('should create 4 corners by default', () => {
      const corners = getDefaultCorners();

      expect(Object.keys(corners)).toHaveLength(4);
      expect(corners.point0).toBeDefined();
      expect(corners.point1).toBeDefined();
      expect(corners.point2).toBeDefined();
      expect(corners.point3).toBeDefined();
    });

    it('should create specified number of corners when valid', () => {
      const corners6 = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 6);
      const corners5 = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 5);
      const corners3 = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 3);

      expect(Object.keys(corners6)).toHaveLength(6);
      expect(Object.keys(corners5)).toHaveLength(5);
      expect(Object.keys(corners3)).toHaveLength(3);
    });

    it('should clamp corner count to minimum of 3', () => {
      const corners = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 2);

      expect(Object.keys(corners)).toHaveLength(3);
    });

    it('should clamp corner count to maximum of 8', () => {
      const corners = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 10);

      expect(Object.keys(corners)).toHaveLength(8);
    });

    it('should handle negative corner counts by clamping to 3', () => {
      const corners = getDefaultCorners(GEOMETRY_TYPES.POLYGON, -5);

      expect(Object.keys(corners)).toHaveLength(3);
    });
  });

  describe('corner positioning', () => {
    it('should position corners centered in viewport', () => {
      const corners = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 4);

      // With 1920x1080, center should be at 960, 540
      const centerX = 960;
      const centerY = 540;

      // Calculate average position of all corners
      const avgX = Object.values(corners).reduce((sum, corner) => sum + corner.x, 0) / 4;
      const avgY = Object.values(corners).reduce((sum, corner) => sum + corner.y, 0) / 4;

      // For a regular polygon centered at (centerX, centerY),
      // the average of all corner positions should equal the center
      expect(Math.abs(avgX - centerX)).toBeLessThan(0.01);
      expect(Math.abs(avgY - centerY)).toBeLessThan(0.01);
    });

    it('should calculate radius as 25% of smaller dimension', () => {
      const corners = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 4);

      // With 1920x1080, smaller dimension is 1080
      // Radius should be 1080 * 0.25 = 270
      const expectedRadius = 270;
      const centerX = 960;
      const centerY = 540;

      // Check distance from center to first corner
      const distance = Math.sqrt(
        Math.pow(corners.point0.x - centerX, 2) +
        Math.pow(corners.point0.y - centerY, 2)
      );

      expect(Math.abs(distance - expectedRadius)).toBeLessThan(0.01);
    });

    it('should distribute corners evenly around circle', () => {
      const corners = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 4);

      const centerX = 960;
      const centerY = 540;
      const radius = 270;

      // For 4 corners, they should be 90 degrees apart
      // Check distance from center for each corner (should all be equal)
      const distances = [];
      for (let i = 0; i < 4; i++) {
        const corner = corners[`point${i}`];
        const distance = Math.sqrt(
          Math.pow(corner.x - centerX, 2) +
          Math.pow(corner.y - centerY, 2)
        );
        distances.push(distance);
      }

      // All distances should be equal to the radius
      distances.forEach(distance => {
        expect(Math.abs(distance - radius)).toBeLessThan(0.01);
      });

      // Check that adjacent corners are separated by 90 degrees
      const expectedAngle = Math.PI / 2; // 90 degrees
      for (let i = 0; i < 4; i++) {
        const corner1 = corners[`point${i}`];
        const corner2 = corners[`point${(i + 1) % 4}`];

        const angle1 = Math.atan2(corner1.y - centerY, corner1.x - centerX);
        const angle2 = Math.atan2(corner2.y - centerY, corner2.x - centerX);

        let angleDiff = angle2 - angle1;
        // Normalize angle difference to [0, 2π]
        if (angleDiff < 0) angleDiff += 2 * Math.PI;

        expect(Math.abs(angleDiff - expectedAngle)).toBeLessThan(0.01);
      }
    });

    it('should start first corner at top (angle -π/2)', () => {
      const corners = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 4);

      const centerX = 960;
      const centerY = 540;
      const radius = 270;

      // First corner should be at top (angle -π/2)
      // Which means x = centerX, y = centerY - radius
      expect(Math.abs(corners.point0.x - centerX)).toBeLessThan(0.01);
      expect(Math.abs(corners.point0.y - (centerY - radius))).toBeLessThan(0.01);
    });
  });

  describe('different viewport dimensions', () => {
    it('should adapt to square viewport', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });

      const corners = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 4);

      // Center should be at 500, 500
      const avgX = Object.values(corners).reduce((sum, corner) => sum + corner.x, 0) / 4;
      const avgY = Object.values(corners).reduce((sum, corner) => sum + corner.y, 0) / 4;

      expect(Math.abs(avgX - 500)).toBeLessThan(0.01);
      expect(Math.abs(avgY - 500)).toBeLessThan(0.01);

      // Radius should be 250 (25% of 1000)
      const distance = Math.sqrt(
        Math.pow(corners.point0.x - 500, 2) +
        Math.pow(corners.point0.y - 500, 2)
      );
      expect(Math.abs(distance - 250)).toBeLessThan(0.01);
    });

    it('should adapt to portrait viewport', () => {
      Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1200, configurable: true });

      const corners = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 4);

      // Center should be at 400, 600
      const avgX = Object.values(corners).reduce((sum, corner) => sum + corner.x, 0) / 4;
      const avgY = Object.values(corners).reduce((sum, corner) => sum + corner.y, 0) / 4;

      expect(Math.abs(avgX - 400)).toBeLessThan(0.01);
      expect(Math.abs(avgY - 600)).toBeLessThan(0.01);

      // Radius should be 200 (25% of smaller dimension: 800)
      const distance = Math.sqrt(
        Math.pow(corners.point0.x - 400, 2) +
        Math.pow(corners.point0.y - 600, 2)
      );
      expect(Math.abs(distance - 200)).toBeLessThan(0.01);
    });

    it('should adapt to very wide viewport', () => {
      Object.defineProperty(window, 'innerWidth', { value: 3840, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true });

      const corners = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 4);

      // Center should be at 1920, 540
      const avgX = Object.values(corners).reduce((sum, corner) => sum + corner.x, 0) / 4;
      const avgY = Object.values(corners).reduce((sum, corner) => sum + corner.y, 0) / 4;

      expect(Math.abs(avgX - 1920)).toBeLessThan(0.01);
      expect(Math.abs(avgY - 540)).toBeLessThan(0.01);

      // Radius based on smaller dimension (1080)
      const expectedRadius = 270;
      const distance = Math.sqrt(
        Math.pow(corners.point0.x - 1920, 2) +
        Math.pow(corners.point0.y - 540, 2)
      );
      expect(Math.abs(distance - expectedRadius)).toBeLessThan(0.01);
    });
  });

  describe('corner structure', () => {
    it('should create corners with x and y properties', () => {
      const corners = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 4);

      Object.values(corners).forEach(corner => {
        expect(corner).toHaveProperty('x');
        expect(corner).toHaveProperty('y');
        expect(typeof corner.x).toBe('number');
        expect(typeof corner.y).toBe('number');
      });
    });

    it('should name corners as point0, point1, etc.', () => {
      const corners = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 5);

      expect(corners).toHaveProperty('point0');
      expect(corners).toHaveProperty('point1');
      expect(corners).toHaveProperty('point2');
      expect(corners).toHaveProperty('point3');
      expect(corners).toHaveProperty('point4');
      expect(corners).not.toHaveProperty('point5');
    });

    it('should produce numeric coordinates within viewport bounds', () => {
      const corners = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 4);

      Object.values(corners).forEach(corner => {
        expect(corner.x).toBeGreaterThan(0);
        expect(corner.x).toBeLessThan(window.innerWidth);
        expect(corner.y).toBeGreaterThan(0);
        expect(corner.y).toBeLessThan(window.innerHeight);
      });
    });
  });

  describe('geometry type parameter', () => {
    it('should accept GEOMETRY_TYPES.POLYGON', () => {
      const corners = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 4);

      expect(Object.keys(corners)).toHaveLength(4);
    });

    it('should work with default geometry type', () => {
      const cornersWithType = getDefaultCorners(GEOMETRY_TYPES.POLYGON, 4);
      const cornersDefault = getDefaultCorners(undefined, 4);

      expect(Object.keys(cornersWithType)).toHaveLength(4);
      expect(Object.keys(cornersDefault)).toHaveLength(4);
    });
  });
});
