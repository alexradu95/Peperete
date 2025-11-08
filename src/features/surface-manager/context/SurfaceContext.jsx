import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { DEFAULT_SURFACE_CONFIG, STORAGE_KEYS, getDefaultCorners, GEOMETRY_TYPES } from '../../../shared/utils/constants';
import { useStorage } from '../../../shared/hooks/useStorage';
import { broadcastManager, MessageTypes } from '../../../shared/utils/broadcastChannel';

/**
 * Surface Manager Context
 * Manages all surfaces, their state, and operations
 * Syncs across tabs via BroadcastChannel
 */

const SurfaceContext = createContext(null);

export function SurfaceProvider({ children }) {
  // Load surfaces from localStorage or start with empty map
  const [storedSurfaces, setStoredSurfaces] = useStorage(STORAGE_KEYS.SURFACES, []);

  // Convert array to Map for efficient lookups
  const [surfaces, setSurfaces] = useState(() => {
    const map = new Map();
    storedSurfaces.forEach(surface => {
      // Ensure loaded surfaces have valid corners and geometry type
      if (!surface.geometryType) {
        surface.geometryType = GEOMETRY_TYPES.POLYGON;
      }
      if (!surface.cornerCount) {
        surface.cornerCount = 4;
      }
      if (!surface.corners || Object.keys(surface.corners).length === 0) {
        surface.corners = getDefaultCorners(surface.geometryType, surface.cornerCount);
      }
      map.set(surface.id, surface);
    });
    return map;
  });

  const [selectedSurfaceId, setSelectedSurfaceIdInternal] = useState(null);

  // Wrapper to broadcast selection changes
  const setSelectedSurfaceId = useCallback((id) => {
    setSelectedSurfaceIdInternal(id);
    broadcastManager.broadcast(MessageTypes.SURFACE_SELECTED, { id });
  }, []);
  const nextIdRef = useRef(storedSurfaces.length + 1);
  const previousSizeRef = useRef({ width: window.innerWidth, height: window.innerHeight });

  // Sync surfaces to localStorage whenever they change
  const syncToStorage = useCallback((surfacesMap) => {
    const surfacesArray = Array.from(surfacesMap.values());
    setStoredSurfaces(surfacesArray);
  }, [setStoredSurfaces]);

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
      corners: getDefaultCorners(geometryType, cornerCount), // Get default corners based on geometry type
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

    // Broadcast to other tabs
    broadcastManager.broadcast(MessageTypes.SURFACE_DELETED, { id });
  }, [selectedSurfaceId, syncToStorage]);

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

  // Listen for broadcasts from other tabs
  useEffect(() => {
    const unsubscribeUpdated = broadcastManager.subscribe(
      MessageTypes.SURFACE_UPDATED,
      (surface) => {
        setSurfaces(prev => {
          const next = new Map(prev);
          next.set(surface.id, surface);
          return next;
        });
      }
    );

    const unsubscribeAdded = broadcastManager.subscribe(
      MessageTypes.SURFACE_ADDED,
      (surface) => {
        setSurfaces(prev => {
          const next = new Map(prev);
          if (!next.has(surface.id)) {
            next.set(surface.id, surface);
          }
          return next;
        });
      }
    );

    const unsubscribeDeleted = broadcastManager.subscribe(
      MessageTypes.SURFACE_DELETED,
      ({ id }) => {
        setSurfaces(prev => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      }
    );

    const unsubscribeSelected = broadcastManager.subscribe(
      MessageTypes.SURFACE_SELECTED,
      ({ id }) => {
        setSelectedSurfaceIdInternal(id);
      }
    );

    return () => {
      unsubscribeUpdated();
      unsubscribeAdded();
      unsubscribeDeleted();
      unsubscribeSelected();
    };
  }, []);

  // Handle window resize - scale all corner positions proportionally
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const prevWidth = previousSizeRef.current.width;
      const prevHeight = previousSizeRef.current.height;

      // Only scale if window size actually changed
      if (currentWidth !== prevWidth || currentHeight !== prevHeight) {
        const scaleX = currentWidth / prevWidth;
        const scaleY = currentHeight / prevHeight;

        setSurfaces(prev => {
          const next = new Map();
          prev.forEach((surface, id) => {
            if (surface.corners) {
              const scaledCorners = {};
              // Scale all corner points regardless of naming convention
              Object.keys(surface.corners).forEach(key => {
                scaledCorners[key] = {
                  x: surface.corners[key].x * scaleX,
                  y: surface.corners[key].y * scaleY
                };
              });
              next.set(id, { ...surface, corners: scaledCorners });
            } else {
              next.set(id, surface);
            }
          });
          syncToStorage(next);
          return next;
        });

        previousSizeRef.current = { width: currentWidth, height: currentHeight };
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [syncToStorage]);

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
