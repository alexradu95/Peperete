import { useCallback, useRef } from 'react';
import { DEFAULT_SURFACE_CONFIG, getDefaultCorners } from '../../../shared/constants';
import { broadcastManager, MessageTypes } from '../../../shared/utils/broadcastChannel';

/**
 * useSurfaceOperations Hook
 *
 * Manages all CRUD operations for surfaces
 * - Add, remove, update surfaces
 * - Update corners, content, visibility, render order
 * - Broadcasts changes to other tabs
 */
export function useSurfaceOperations(
  surfaces,
  setSurfaces,
  syncToStorage,
  selectedSurfaceId,
  setSelectedSurfaceId,
  initialCount
) {
  const nextIdRef = useRef(initialCount + 1);

  // Add new surface
  const addSurface = useCallback((config = {}) => {
    const id = `surface-${nextIdRef.current++}`;
    const geometryType = config.geometryType || DEFAULT_SURFACE_CONFIG.geometryType;
    const cornerCount = config.cornerCount || DEFAULT_SURFACE_CONFIG.cornerCount;

    const newSurface = {
      id,
      ...DEFAULT_SURFACE_CONFIG,
      geometryType,
      cornerCount,
      corners: getDefaultCorners(geometryType, cornerCount),
      ...config,
      name: config.name || `Surface ${nextIdRef.current - 1}`
    };

    setSurfaces(prev => {
      const next = new Map(prev);
      next.set(id, newSurface);
      syncToStorage(next);
      return next;
    });

    setSelectedSurfaceId(id);

    // Broadcast to other tabs
    broadcastManager.broadcast(MessageTypes.SURFACE_ADDED, newSurface);

    return id;
  }, [setSurfaces, syncToStorage, setSelectedSurfaceId]);

  // Remove surface
  const removeSurface = useCallback((id) => {
    setSurfaces(prev => {
      const next = new Map(prev);
      next.delete(id);
      syncToStorage(next);
      return next;
    });

    if (selectedSurfaceId === id) {
      setSelectedSurfaceId(null);
    }

    // Broadcast to other tabs
    broadcastManager.broadcast(MessageTypes.SURFACE_DELETED, { id });
  }, [setSurfaces, syncToStorage, selectedSurfaceId, setSelectedSurfaceId]);

  // Update surface
  const updateSurface = useCallback((id, updates) => {
    setSurfaces(prev => {
      const next = new Map(prev);
      const surface = next.get(id);
      if (surface) {
        const updatedSurface = { ...surface, ...updates };
        next.set(id, updatedSurface);
        syncToStorage(next);

        // Broadcast to other tabs
        broadcastManager.broadcast(MessageTypes.SURFACE_UPDATED, updatedSurface);
      }
      return next;
    });
  }, [setSurfaces, syncToStorage]);

  // Update surface corners
  const updateSurfaceCorners = useCallback((id, corners) => {
    updateSurface(id, { corners });
  }, [updateSurface]);

  // Update surface content type
  const updateSurfaceContent = useCallback((id, contentType, contentData = {}) => {
    updateSurface(id, { contentType, contentData });
  }, [updateSurface]);

  // Toggle surface visibility
  const toggleSurfaceVisibility = useCallback((id) => {
    setSurfaces(prev => {
      const next = new Map(prev);
      const surface = next.get(id);
      if (surface) {
        next.set(id, { ...surface, visible: !surface.visible });
        syncToStorage(next);
      }
      return next;
    });
  }, [setSurfaces, syncToStorage]);

  // Set surface render order
  const setSurfaceRenderOrder = useCallback((id, renderOrder) => {
    updateSurface(id, { renderOrder });
  }, [updateSurface]);

  // Get surface by ID
  const getSurface = useCallback((id) => {
    return surfaces.get(id);
  }, [surfaces]);

  // Get all surfaces as array
  const getAllSurfaces = useCallback(() => {
    return Array.from(surfaces.values());
  }, [surfaces]);

  // Clear all surfaces
  const clearAllSurfaces = useCallback((setStoredSurfaces) => {
    setSurfaces(new Map());
    setStoredSurfaces([]);
    setSelectedSurfaceId(null);
    nextIdRef.current = 1;
  }, [setSurfaces, setSelectedSurfaceId]);

  return {
    addSurface,
    removeSurface,
    updateSurface,
    updateSurfaceCorners,
    updateSurfaceContent,
    toggleSurfaceVisibility,
    setSurfaceRenderOrder,
    getSurface,
    getAllSurfaces,
    clearAllSurfaces
  };
}
