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
      className="fixed w-10 h-10 -ml-5 -mt-5 cursor-move select-none touch-none z-[1000]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div className="w-full h-full bg-red-500/50 border-[3px] border-red-500 rounded-full transition-all hover:bg-red-500/70 hover:scale-[1.2] active:bg-red-500/90 active:scale-[1.3]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold text-xs pointer-events-none [text-shadow:_0_0_4px_rgba(0,0,0,0.8)]">{label}</div>
    </div>
  );
}
