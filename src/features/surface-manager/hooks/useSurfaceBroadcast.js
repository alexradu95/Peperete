import { useEffect } from 'react';
import { broadcastManager, MessageTypes } from '../../../shared/utils/broadcastChannel';

/**
 * useSurfaceBroadcast Hook
 *
 * Manages cross-tab synchronization for surfaces via BroadcastChannel
 * Listens for:
 * - SURFACE_UPDATED: Updates existing surface
 * - SURFACE_ADDED: Adds new surface from other tab
 * - SURFACE_DELETED: Removes surface deleted in other tab
 * - SURFACE_SELECTED: Syncs surface selection across tabs
 */
export function useSurfaceBroadcast(setSurfaces, setSelectedSurfaceIdInternal) {
  useEffect(() => {
    // Listen for surface updates from other tabs
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

    // Listen for surface additions from other tabs
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

    // Listen for surface deletions from other tabs
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

    // Listen for surface selection from other tabs
    const unsubscribeSelected = broadcastManager.subscribe(
      MessageTypes.SURFACE_SELECTED,
      ({ id }) => {
        setSelectedSurfaceIdInternal(id);
      }
    );

    // Cleanup all subscriptions
    return () => {
      unsubscribeUpdated();
      unsubscribeAdded();
      unsubscribeDeleted();
      unsubscribeSelected();
    };
  }, [setSurfaces, setSelectedSurfaceIdInternal]);
}
