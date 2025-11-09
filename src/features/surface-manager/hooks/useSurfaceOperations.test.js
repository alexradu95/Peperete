import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSurfaceOperations } from './useSurfaceOperations';

// Mock broadcastManager
vi.mock('../../../shared/utils/broadcastChannel', () => ({
  broadcastManager: {
    broadcast: vi.fn()
  },
  MessageTypes: {
    SURFACE_ADDED: 'SURFACE_ADDED',
    SURFACE_DELETED: 'SURFACE_DELETED',
    SURFACE_UPDATED: 'SURFACE_UPDATED',
    SURFACE_SELECTED: 'SURFACE_SELECTED'
  }
}));

describe('useSurfaceOperations', () => {
  let surfaces;
  let setSurfaces;
  let syncToStorage;
  let selectedSurfaceId;
  let setSelectedSurfaceId;

  beforeEach(() => {
    surfaces = new Map();
    setSurfaces = vi.fn((updater) => {
      if (typeof updater === 'function') {
        surfaces = updater(surfaces);
      }
    });
    syncToStorage = vi.fn();
    selectedSurfaceId = null;
    setSelectedSurfaceId = vi.fn();
  });

  describe('addSurface', () => {
    it('should add a new surface with default config', () => {
      const { result } = renderHook(() =>
        useSurfaceOperations(
          surfaces,
          setSurfaces,
          syncToStorage,
          selectedSurfaceId,
          setSelectedSurfaceId,
          0
        )
      );

      let surfaceId;
      act(() => {
        surfaceId = result.current.addSurface();
      });

      expect(surfaceId).toBeDefined();
      expect(surfaceId).toMatch(/^surface-/);
      expect(setSurfaces).toHaveBeenCalled();
      expect(setSelectedSurfaceId).toHaveBeenCalledWith(surfaceId);
    });

    it('should add surface with custom config', () => {
      const { result } = renderHook(() =>
        useSurfaceOperations(
          surfaces,
          setSurfaces,
          syncToStorage,
          selectedSurfaceId,
          setSelectedSurfaceId,
          0
        )
      );

      act(() => {
        result.current.addSurface({
          name: 'Custom Surface',
          geometryType: 'polygon',
          cornerCount: 6
        });
      });

      expect(setSurfaces).toHaveBeenCalled();
    });
  });

  describe('removeSurface', () => {
    it('should remove an existing surface', () => {
      surfaces.set('surface-1', { id: 'surface-1', name: 'Test' });

      const { result } = renderHook(() =>
        useSurfaceOperations(
          surfaces,
          setSurfaces,
          syncToStorage,
          null,
          setSelectedSurfaceId,
          1
        )
      );

      act(() => {
        result.current.removeSurface('surface-1');
      });

      expect(setSurfaces).toHaveBeenCalled();
    });

    it('should deselect surface if it was selected', () => {
      surfaces.set('surface-1', { id: 'surface-1', name: 'Test' });

      const { result } = renderHook(() =>
        useSurfaceOperations(
          surfaces,
          setSurfaces,
          syncToStorage,
          'surface-1',
          setSelectedSurfaceId,
          1
        )
      );

      act(() => {
        result.current.removeSurface('surface-1');
      });

      expect(setSelectedSurfaceId).toHaveBeenCalledWith(null);
    });
  });

  describe('updateSurface', () => {
    it('should update an existing surface', () => {
      surfaces.set('surface-1', { id: 'surface-1', name: 'Test', visible: true });

      const { result } = renderHook(() =>
        useSurfaceOperations(
          surfaces,
          setSurfaces,
          syncToStorage,
          null,
          setSelectedSurfaceId,
          1
        )
      );

      act(() => {
        result.current.updateSurface('surface-1', { name: 'Updated Name' });
      });

      expect(setSurfaces).toHaveBeenCalled();
    });

    it('should not update non-existent surface', () => {
      const { result } = renderHook(() =>
        useSurfaceOperations(
          surfaces,
          setSurfaces,
          syncToStorage,
          null,
          setSelectedSurfaceId,
          0
        )
      );

      act(() => {
        result.current.updateSurface('non-existent', { name: 'Test' });
      });

      expect(setSurfaces).toHaveBeenCalled();
    });
  });

  describe('getSurface', () => {
    it('should return existing surface', () => {
      const testSurface = { id: 'surface-1', name: 'Test' };
      surfaces.set('surface-1', testSurface);

      const { result } = renderHook(() =>
        useSurfaceOperations(
          surfaces,
          setSurfaces,
          syncToStorage,
          null,
          setSelectedSurfaceId,
          1
        )
      );

      const surface = result.current.getSurface('surface-1');
      expect(surface).toEqual(testSurface);
    });

    it('should return undefined for non-existent surface', () => {
      const { result } = renderHook(() =>
        useSurfaceOperations(
          surfaces,
          setSurfaces,
          syncToStorage,
          null,
          setSelectedSurfaceId,
          0
        )
      );

      const surface = result.current.getSurface('non-existent');
      expect(surface).toBeUndefined();
    });
  });

  describe('getAllSurfaces', () => {
    it('should return all surfaces as array', () => {
      surfaces.set('surface-1', { id: 'surface-1', name: 'Test 1' });
      surfaces.set('surface-2', { id: 'surface-2', name: 'Test 2' });

      const { result } = renderHook(() =>
        useSurfaceOperations(
          surfaces,
          setSurfaces,
          syncToStorage,
          null,
          setSelectedSurfaceId,
          2
        )
      );

      const allSurfaces = result.current.getAllSurfaces();
      expect(allSurfaces).toHaveLength(2);
      expect(allSurfaces.map(s => s.id)).toContain('surface-1');
      expect(allSurfaces.map(s => s.id)).toContain('surface-2');
    });

    it('should return empty array when no surfaces exist', () => {
      const { result } = renderHook(() =>
        useSurfaceOperations(
          surfaces,
          setSurfaces,
          syncToStorage,
          null,
          setSelectedSurfaceId,
          0
        )
      );

      const allSurfaces = result.current.getAllSurfaces();
      expect(allSurfaces).toEqual([]);
    });
  });
});
