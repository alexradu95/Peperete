import { useRef } from 'react';
import { useDrag } from '@use-gesture/react';
import {
  TRANSFORM_MODES,
  moveSurface,
  rotateSurface,
  scaleSurface,
  calculateSurfaceCenter,
} from '../utils/SurfaceTransformations';

/**
 * useWholeTransform Hook
 *
 * Manages whole-surface transformations (move, rotate, scale)
 * using drag gestures
 */
export function useWholeTransform(surface, transformMode, updateSurfaceCorners) {
  const transformStateRef = useRef({
    initialCorners: null,
    initialCenter: null,
    initialAngle: 0,
    initialDistance: 0
  });

  const bindSurfaceDrag = useDrag(
    ({ offset: [x, y], first, last, movement: [mx, my], xy: [currentX, currentY] }) => {
      if (!surface) return;

      if (transformMode === TRANSFORM_MODES.MOVE) {
        // Move mode: translate surface
        if (first) {
          transformStateRef.current.initialCorners = { ...surface.corners };
        }
        const [dx, dy] = [x, y];
        const newCorners = moveSurface(transformStateRef.current.initialCorners, dx, dy);
        updateSurfaceCorners(surface.id, newCorners);
      } else if (transformMode === TRANSFORM_MODES.ROTATE) {
        // Rotate mode: rotate around center
        if (first) {
          transformStateRef.current.initialCorners = { ...surface.corners };
          const center = calculateSurfaceCenter(surface.corners);
          transformStateRef.current.initialCenter = center;
          transformStateRef.current.initialAngle = Math.atan2(
            currentY - center.y,
            currentX - center.x
          );
        }

        const center = transformStateRef.current.initialCenter;
        const currentAngle = Math.atan2(currentY - center.y, currentX - center.x);
        const deltaAngle = currentAngle - transformStateRef.current.initialAngle;

        const newCorners = rotateSurface(
          transformStateRef.current.initialCorners,
          deltaAngle,
          center
        );
        updateSurfaceCorners(surface.id, newCorners);
      } else if (transformMode === TRANSFORM_MODES.SCALE) {
        // Scale mode: scale from center
        if (first) {
          transformStateRef.current.initialCorners = { ...surface.corners };
          const center = calculateSurfaceCenter(surface.corners);
          transformStateRef.current.initialCenter = center;
          transformStateRef.current.initialDistance = Math.sqrt(
            Math.pow(currentX - center.x, 2) + Math.pow(currentY - center.y, 2)
          );
        }

        const center = transformStateRef.current.initialCenter;
        const currentDistance = Math.sqrt(
          Math.pow(currentX - center.x, 2) + Math.pow(currentY - center.y, 2)
        );

        const scaleFactor =
          transformStateRef.current.initialDistance > 0
            ? currentDistance / transformStateRef.current.initialDistance
            : 1;

        const newCorners = scaleSurface(
          transformStateRef.current.initialCorners,
          scaleFactor,
          scaleFactor,
          center
        );
        updateSurfaceCorners(surface.id, newCorners);
      }
    },
    {
      from: () => [0, 0],
    }
  );

  return { bindSurfaceDrag };
}
