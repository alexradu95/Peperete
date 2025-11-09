import { describe, it, expect } from 'vitest';
import { createDefaultSurface, createSurfaceWithCorners } from './surface-factory';

describe('Surface Factory', () => {
  describe('createDefaultSurface', () => {
    it('should create a surface with default values', () => {
      const surface = createDefaultSurface({ id: 'test-1' });

      expect(surface.id).toBe('test-1');
      expect(surface.name).toBe('Surface');
      expect(surface.contentType).toBe('checkerboard');
      expect(surface.geometryType).toBe('polygon');
      expect(surface.cornerCount).toBe(4);
      expect(surface.visible).toBe(true);
      expect(surface.renderOrder).toBe(0);
      expect(surface.audioReactive).toBe(false);
    });

    it('should allow overriding default values', () => {
      const surface = createDefaultSurface({
        id: 'test-2',
        name: 'Custom Surface',
        contentType: 'plasma',
        visible: false
      });

      expect(surface.id).toBe('test-2');
      expect(surface.name).toBe('Custom Surface');
      expect(surface.contentType).toBe('plasma');
      expect(surface.visible).toBe(false);
      expect(surface.geometryType).toBe('polygon'); // Still default
    });

    it('should create corners with 4 points by default', () => {
      const surface = createDefaultSurface({ id: 'test-3' });

      expect(surface.corners).toBeDefined();
      expect(Object.keys(surface.corners)).toHaveLength(4);
      expect(surface.corners['point0']).toBeDefined();
      expect(surface.corners['point1']).toBeDefined();
      expect(surface.corners['point2']).toBeDefined();
      expect(surface.corners['point3']).toBeDefined();
    });

    it('should create corners with specified corner count', () => {
      const surface = createDefaultSurface({
        id: 'test-4',
        cornerCount: 6
      });

      expect(Object.keys(surface.corners)).toHaveLength(6);
      expect(surface.corners['point0']).toBeDefined();
      expect(surface.corners['point5']).toBeDefined();
    });

    it('should validate corner positions are numbers', () => {
      const surface = createDefaultSurface({ id: 'test-5' });
      const point0 = surface.corners['point0'];

      expect(point0).toBeDefined();
      expect(typeof point0?.x).toBe('number');
      expect(typeof point0?.y).toBe('number');
    });
  });

  describe('createSurfaceWithCorners', () => {
    it('should create a surface with custom corner positions', () => {
      const customCorners = {
        point0: { x: 100, y: 100 },
        point1: { x: 200, y: 100 },
        point2: { x: 200, y: 200 },
        point3: { x: 100, y: 200 }
      };

      const surface = createSurfaceWithCorners({
        id: 'test-6',
        corners: customCorners
      });

      expect(surface.corners).toEqual(customCorners);
    });

    it('should merge custom corners with default surface properties', () => {
      const customCorners = {
        point0: { x: 50, y: 50 },
        point1: { x: 150, y: 50 },
        point2: { x: 150, y: 150 },
        point3: { x: 50, y: 150 }
      };

      const surface = createSurfaceWithCorners({
        id: 'test-7',
        name: 'Custom',
        corners: customCorners,
        contentType: 'grid'
      });

      expect(surface.id).toBe('test-7');
      expect(surface.name).toBe('Custom');
      expect(surface.contentType).toBe('grid');
      expect(surface.corners).toEqual(customCorners);
    });
  });
});
