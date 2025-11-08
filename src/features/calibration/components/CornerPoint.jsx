import React, { useCallback } from 'react';
import { useDrag } from '@use-gesture/react';

/**
 * Corner Point Component
 * Draggable corner point for calibration
 */
export function CornerPoint({ corner, position, onDrag, label }) {
  const bind = useDrag(
    ({ offset: [x, y], first, last }) => {
      onDrag(corner, { x, y });
    },
    {
      from: () => [position.x, position.y],
      bounds: {
        left: 0,
        right: window.innerWidth,
        top: 0,
        bottom: window.innerHeight
      }
    }
  );

  return (
    <div
      {...bind()}
      className="corner-point"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div className="corner-point-handle"></div>
      <div className="corner-point-label">{label}</div>
    </div>
  );
}
