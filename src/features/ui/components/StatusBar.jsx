import React from 'react';
import { useApp } from '../../../shared/context/AppContext';
import { APP_MODES } from '../../../shared/utils/constants';

/**
 * Status Bar Component
 * Shows current mode and helpful keyboard shortcuts
 */
export function StatusBar() {
  const { mode, toggleMode, toggleFullscreen } = useApp();

  return (
    <div className="fixed bottom-0 left-[300px] right-0 h-10 bg-black/80 border-t border-white/10 flex items-center justify-between px-5 z-[1000] text-white text-[13px]">
      <div className="flex items-center gap-2.5">
        <span className="text-white/60">Mode:</span>
        <span className={`font-semibold px-3 py-1 rounded ${mode === APP_MODES.CALIBRATION ? 'bg-orange-500/20 text-[#ffaa00]' : 'bg-green-500/20 text-[#00ff00]'}`}>
          {mode === APP_MODES.CALIBRATION ? 'Calibration' : 'Playback'}
        </span>
      </div>

      <div className="flex gap-4">
        <span className="text-white/70 flex items-center gap-1.5">
          <kbd>Space</kbd> Toggle Mode
        </span>
        <span className="text-white/70 flex items-center gap-1.5">
          <kbd>F</kbd> Fullscreen
        </span>
        <span className="text-white/70 flex items-center gap-1.5">
          <kbd>A</kbd> Add Surface
        </span>
      </div>
    </div>
  );
}
