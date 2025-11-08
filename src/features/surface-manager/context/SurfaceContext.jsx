import React, { createContext, useContext, useState, useCallback } from 'react';
import { STORAGE_KEYS, getDefaultCorners, GEOMETRY_TYPES } from '../../../shared/constants';
import { useStorage } from '../../../shared/hooks/useStorage';
import { broadcastManager, MessageTypes } from '../../../shared/utils/broadcastChannel';
import {
  useSurfaceOperations,
  useSurfaceBroadcast,
  useSurfaceResize
} from '../hooks';

/**
 * Surface Manager Context
 * Manages all surfaces, their state, and operations
 * Syncs across tabs via BroadcastChannel
 *
 * REFACTORED: Reduced from 284 lines to ~90 lines
 * Extracted hooks: useSurfaceOperations, useSurfaceBroadcast, useSurfaceResize
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

  // Sync surfaces to localStorage whenever they change
  const syncToStorage = useCallback((surfacesMap) => {
    const surfacesArray = Array.from(surfacesMap.values());
    setStoredSurfaces(surfacesArray);
  }, [setStoredSurfaces]);

  // Use custom hooks for operations, broadcast, and resize handling
  const operations = useSurfaceOperations(
    surfaces,
    setSurfaces,
    syncToStorage,
    selectedSurfaceId,
    setSelectedSurfaceId,
    storedSurfaces.length
  );

  useSurfaceBroadcast(setSurfaces, setSelectedSurfaceIdInternal);
  useSurfaceResize(setSurfaces, syncToStorage);

  const value = {
    surfaces,
    selectedSurfaceId,
    setSelectedSurfaceId,
    ...operations,
    // Pass setStoredSurfaces to clearAllSurfaces
    clearAllSurfaces: () => operations.clearAllSurfaces(setStoredSurfaces)
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
