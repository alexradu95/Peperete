import React from 'react';
import { TRANSFORM_MODES } from '../utils/SurfaceTransformations';

/**
 * UI component for selecting transformation mode
 */
export function TransformModeSelector({ mode, onModeChange }) {
  const modes = [
    { value: TRANSFORM_MODES.CORNERS, label: 'Corners', icon: '⬡' },
    { value: TRANSFORM_MODES.MOVE, label: 'Move', icon: '✥' },
    { value: TRANSFORM_MODES.ROTATE, label: 'Rotate', icon: '↻' },
    { value: TRANSFORM_MODES.SCALE, label: 'Scale', icon: '⇲' },
  ];

  return (
    <div className="absolute top-5 left-5 z-[1000] pointer-events-auto flex flex-col gap-2 mb-4 p-3 bg-black/30 rounded">
      <div className="text-xs font-semibold text-white uppercase tracking-wide">Transform Mode:</div>
      <div className="flex gap-1 bg-black/20 p-1 rounded">
        {modes.map(({ value, label, icon }) => (
          <button
            key={value}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 ${mode === value ? 'bg-[rgba(74,144,226,0.5)] border-[rgba(74,144,226,0.8)] shadow-[0_2px_8px_rgba(74,144,226,0.3)]' : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'} border rounded text-white cursor-pointer transition-all hover:-translate-y-px`}
            onClick={() => onModeChange(value)}
            title={label}
          >
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-[11px] font-medium uppercase tracking-wide max-md:hidden">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
