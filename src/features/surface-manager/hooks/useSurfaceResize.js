import { useEffect, useRef } from 'react';

/**
 * useSurfaceResize Hook
 *
 * Handles window resize events and scales all surface corner positions proportionally
 * This ensures surfaces maintain their relative positions when window is resized
 */
export function useSurfaceResize(setSurfaces, syncToStorage) {
  const previousSizeRef = useRef({ width: window.innerWidth, height: window.innerHeight });

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
  }, [setSurfaces, syncToStorage]);
}
