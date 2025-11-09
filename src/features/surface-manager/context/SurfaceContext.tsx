import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { DEFAULT_SURFACE_CONFIG, STORAGE_KEYS, getDefaultCorners, GEOMETRY_TYPES } from '../../../shared/utils/constants';
import { useStorage } from '../../../shared/hooks/useStorage';
import { SurfaceArraySchema, type Surface } from '../../../shared/schemas';
import { broadcastManager, MessageTypes } from '../../../shared/utils/broadcast-channel';
import type { ContentType, GeometryType, Corners, ContentData } from '../../../shared/schemas';

/**
 * Configuration for creating a new surface
 */
export interface SurfaceConfig {
  name?: string;
  contentType?: ContentType;
  contentData?: ContentData;
  geometryType?: GeometryType;
  cornerCount?: number;
  corners?: Corners;
  visible?: boolean;
  renderOrder?: number;
  audioReactive?: boolean;
}

/**
 * Partial updates for a surface
 */
export type SurfaceUpdates = Partial<Omit<Surface, 'id'>>;

/**
 * Surface Context Value interface
 * Provides surface management state and CRUD operations
 */
export interface SurfaceContextValue {
  /** Map of all surfaces by ID */
  surfaces: Map<string, Surface>;

  /** Currently selected surface ID */
  selectedSurfaceId: string | null;

  /** Set the selected surface ID */
  setSelectedSurfaceId: (id: string | null) => void;

  /** Add a new surface with optional configuration */
  addSurface: (config?: SurfaceConfig) => string;

  /** Remove a surface by ID */
  removeSurface: (id: string) => void;

  /** Update a surface with partial updates */
  updateSurface: (id: string, updates: SurfaceUpdates) => void;

  /** Update surface corner positions */
  updateSurfaceCorners: (id: string, corners: Corners) => void;

  /** Update surface content type and data */
  updateSurfaceContent: (id: string, contentType: ContentType, contentData?: ContentData) => void;

  /** Toggle surface visibility on/off */
  toggleSurfaceVisibility: (id: string) => void;

  /** Set surface render order (z-index) */
  setSurfaceRenderOrder: (id: string, renderOrder: number) => void;

  /** Get a surface by ID */
  getSurface: (id: string) => Surface | undefined;

  /** Get all surfaces as an array */
  getAllSurfaces: () => Surface[];

  /** Clear all surfaces */
  clearAllSurfaces: () => void;
}

/**
 * Props for SurfaceProvider component
 */
interface SurfaceProviderProps {
  children: React.ReactNode;
}

/**
 * Surface Manager Context
 * Manages all surfaces, their state, and operations
 * Syncs across tabs via BroadcastChannel
 */
const SurfaceContext = createContext<SurfaceContextValue | null>(null);

/**
 * SurfaceProvider Component
 * Provides surface management functionality to child components
 *
 * Features:
 * - CRUD operations for surfaces
 * - localStorage persistence with schema validation
 * - Cross-tab synchronization via BroadcastChannel
 * - Automatic window resize handling with proportional corner scaling
 * - Map-based storage for O(1) lookups
 *
 * @example
 * ```tsx
 * <SurfaceProvider>
 *   <YourComponent />
 * </SurfaceProvider>
 * ```
 */
export function SurfaceProvider({ children }: SurfaceProviderProps) {
  // Load surfaces from localStorage with schema validation
  const [storedSurfaces, setStoredSurfaces] = useStorage({
    key: STORAGE_KEYS.SURFACES,
    defaultValue: [] as Surface[],
    schema: SurfaceArraySchema
  });

  // Convert array to Map for efficient lookups
  const [surfaces, setSurfaces] = useState<Map<string, Surface>>(() => {
    const map = new Map<string, Surface>();
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

  const [selectedSurfaceId, setSelectedSurfaceIdInternal] = useState<string | null>(null);

  // Refs for internal tracking
  const nextIdRef = useRef(storedSurfaces.length + 1);
  const previousSizeRef = useRef({ width: window.innerWidth, height: window.innerHeight });

  /**
   * Sync surfaces Map to localStorage array
   */
  const syncToStorage = useCallback((surfacesMap: Map<string, Surface>) => {
    const surfacesArray = Array.from(surfacesMap.values());
    setStoredSurfaces(surfacesArray);
  }, [setStoredSurfaces]);

  /**
   * Set selected surface ID and broadcast to other tabs
   */
  const setSelectedSurfaceId = useCallback((id: string | null) => {
    setSelectedSurfaceIdInternal(id);
    broadcastManager.broadcast(MessageTypes.SURFACE_SELECTED, { id });
  }, []);

  /**
   * Add a new surface with optional configuration
   * @param config - Optional surface configuration
   * @returns The ID of the newly created surface
   */
  const addSurface = useCallback((config: SurfaceConfig = {}): string => {
    const id = `surface-${nextIdRef.current++}`;
    const geometryType = config.geometryType || DEFAULT_SURFACE_CONFIG.geometryType;
    const cornerCount = config.cornerCount || DEFAULT_SURFACE_CONFIG.cornerCount;

    const newSurface: Surface = {
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
  }, [syncToStorage, setSelectedSurfaceId]);

  /**
   * Remove a surface by ID
   */
  const removeSurface = useCallback((id: string) => {
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
  }, [selectedSurfaceId, setSelectedSurfaceId, syncToStorage]);

  /**
   * Update a surface with partial updates
   */
  const updateSurface = useCallback((id: string, updates: SurfaceUpdates) => {
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

  /**
   * Update surface corner positions
   */
  const updateSurfaceCorners = useCallback((id: string, corners: Corners) => {
    updateSurface(id, { corners });
  }, [updateSurface]);

  /**
   * Update surface content type and data
   */
  const updateSurfaceContent = useCallback((id: string, contentType: ContentType, contentData: ContentData = {}) => {
    updateSurface(id, { contentType, contentData });
  }, [updateSurface]);

  /**
   * Toggle surface visibility on/off
   */
  const toggleSurfaceVisibility = useCallback((id: string) => {
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

  /**
   * Set surface render order (z-index)
   */
  const setSurfaceRenderOrder = useCallback((id: string, renderOrder: number) => {
    updateSurface(id, { renderOrder });
  }, [updateSurface]);

  /**
   * Get a surface by ID
   */
  const getSurface = useCallback((id: string): Surface | undefined => {
    return surfaces.get(id);
  }, [surfaces]);

  /**
   * Get all surfaces as an array
   */
  const getAllSurfaces = useCallback((): Surface[] => {
    return Array.from(surfaces.values());
  }, [surfaces]);

  /**
   * Clear all surfaces
   */
  const clearAllSurfaces = useCallback(() => {
    setSurfaces(new Map());
    setStoredSurfaces([]);
    setSelectedSurfaceId(null);
    nextIdRef.current = 1;
  }, [setStoredSurfaces, setSelectedSurfaceId]);

  // Listen for broadcasts from other tabs
  useEffect(() => {
    const unsubscribeUpdated = broadcastManager.subscribe(
      MessageTypes.SURFACE_UPDATED,
      (surface: Surface) => {
        setSurfaces(prev => {
          const next = new Map(prev);
          next.set(surface.id, surface);
          return next;
        });
      }
    );

    const unsubscribeAdded = broadcastManager.subscribe(
      MessageTypes.SURFACE_ADDED,
      (surface: Surface) => {
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
      ({ id }: { id: string }) => {
        setSurfaces(prev => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      }
    );

    const unsubscribeSelected = broadcastManager.subscribe(
      MessageTypes.SURFACE_SELECTED,
      ({ id }: { id: string | null }) => {
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
          const next = new Map<string, Surface>();
          prev.forEach((surface, id) => {
            if (surface.corners) {
              const scaledCorners: Corners = {};
              // Scale all corner points regardless of naming convention
              Object.keys(surface.corners).forEach(key => {
                scaledCorners[key] = {
                  x: surface.corners[key]!.x * scaleX,
                  y: surface.corners[key]!.y * scaleY
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

  const value: SurfaceContextValue = {
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

/**
 * useSurfaces Hook
 * Access surface management state and methods from any child component
 *
 * @throws Error if used outside of SurfaceProvider
 * @returns Surface context value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { surfaces, addSurface, getSurface } = useSurfaces();
 *
 *   const handleAdd = () => {
 *     const id = addSurface({ name: 'My Surface' });
 *     const surface = getSurface(id);
 *   };
 *
 *   return <button onClick={handleAdd}>Add Surface</button>;
 * }
 * ```
 */
export function useSurfaces(): SurfaceContextValue {
  const context = useContext(SurfaceContext);
  if (!context) {
    throw new Error('useSurfaces must be used within SurfaceProvider');
  }
  return context;
}
