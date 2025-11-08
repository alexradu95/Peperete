import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { DEFAULT_SURFACE_CONFIG, STORAGE_KEYS } from '../../../shared/utils/constants';
import { useStorage } from '../../../shared/hooks/useStorage';

/**
 * Surface Manager Context
 * Manages all surfaces, their state, and operations
 */

const SurfaceContext = createContext(null);

export function SurfaceProvider({ children }) {
  // Load surfaces from localStorage or start with empty map
  const [storedSurfaces, setStoredSurfaces] = useStorage(STORAGE_KEYS.SURFACES, []);

  // Convert array to Map for efficient lookups
  const [surfaces, setSurfaces] = useState(() => {
    const map = new Map();
    storedSurfaces.forEach(surface => {
      map.set(surface.id, surface);
    });
    return map;
  });

  const [selectedSurfaceId, setSelectedSurfaceId] = useState(null);
  const nextIdRef = useRef(storedSurfaces.length + 1);

  // Sync surfaces to localStorage whenever they change
  const syncToStorage = useCallback((surfacesMap) => {
    const surfacesArray = Array.from(surfacesMap.values());
    setStoredSurfaces(surfacesArray);
  }, [setStoredSurfaces]);

  // Add new surface
  const addSurface = useCallback((config = {}) => {
    const id = `surface-${nextIdRef.current++}`;
    const newSurface = {
      id,
      ...DEFAULT_SURFACE_CONFIG,
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
    return id;
  }, [syncToStorage]);

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
  }, [selectedSurfaceId, syncToStorage]);

  // Update surface
  const updateSurface = useCallback((id, updates) => {
    setSurfaces(prev => {
      const next = new Map(prev);
      const surface = next.get(id);
      if (surface) {
        next.set(id, { ...surface, ...updates });
        syncToStorage(next);
      }
      return next;
    });
  }, [syncToStorage]);

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
  }, [syncToStorage]);

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
  const clearAllSurfaces = useCallback(() => {
    setSurfaces(new Map());
    setStoredSurfaces([]);
    setSelectedSurfaceId(null);
    nextIdRef.current = 1;
  }, [setStoredSurfaces]);

  const value = {
    surfaces,
    selectedSurfaceId,
    setSelectedSurfaceId,
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

  return <SurfaceContext.Provider value={value}>{children}</SurfaceContext.Provider>;
}

export function useSurfaces() {
  const context = useContext(SurfaceContext);
  if (!context) {
    throw new Error('useSurfaces must be used within SurfaceProvider');
  }
  return context;
}
