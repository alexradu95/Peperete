import React from 'react';
import { useApp } from '../../../shared/context/AppContext';
import { APP_MODES } from '../../../shared/utils/constants';
import './StatusBar.css';

/**
 * Status Bar Component
 * Shows current mode and helpful keyboard shortcuts
 */
export function StatusBar() {
  const { mode, toggleMode, toggleFullscreen } = useApp();

  return (
    <div className="status-bar">
      <div className="status-mode">
        <span className="mode-label">Mode:</span>
        <span className={`mode-value ${mode}`}>
          {mode === APP_MODES.CALIBRATION ? 'Calibration' : 'Playback'}
        </span>
      </div>

      <div className="status-shortcuts">
        <span className="shortcut">
          <kbd>Space</kbd> Toggle Mode
        </span>
        <span className="shortcut">
          <kbd>F</kbd> Fullscreen
        </span>
        <span className="shortcut">
          <kbd>A</kbd> Add Surface
        </span>
      </div>
    </div>
  );
}
