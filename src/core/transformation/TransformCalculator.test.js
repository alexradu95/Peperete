import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransformCalculator } from './TransformCalculator';

describe('TransformCalculator', () => {
  beforeEach(() => {
    // Mock canvas and window dimensions
    global.window = {
      innerWidth: 800,
      innerHeight: 600
    };

    // Mock canvas element
    const mockCanvas = {
      getBoundingClientRect: () => ({
        width: 800,
        height: 600
      })
    };

    global.document = {
      querySelector: vi.fn((selector) => {
        if (selector === 'canvas') {
          return mockCanvas;
        }
        return null;
      })
    };
  });

  describe('getCanvasDimensions', () => {
    it('should return canvas dimensions from canvas element', () => {
      const dims = TransformCalculator.getCanvasDimensions();
      expect(dims.width).toBe(800);
      expect(dims.height).toBe(600);
    });
  });

  describe('normalizeX', () => {
    it('should normalize X coordinate considering aspect ratio', () => {
      const normalized = TransformCalculator.normalizeX(400); // center X
      expect(normalized).toBeCloseTo(0, 1);
    });
  });

  describe('normalizeY', () => {
    it('should normalize Y coordinate with inversion', () => {
      const normalized = TransformCalculator.normalizeY(300); // center Y
      expect(normalized).toBeCloseTo(0, 1);
    });
  });

});
