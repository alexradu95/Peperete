import React from 'react';
import { AudioControls } from './AudioControls';

/**
 * PanelHeader Component
 *
 * Header section of SurfacePanel with title, audio controls, and action buttons
 */
export function PanelHeader({
  isAudioEnabled,
  toggleAudio,
  audioData,
  error,
  onLaunchLiveView,
  onAddSurface
}) {
  return (
    <div className="surface-panel-header">
      <h2>Surfaces</h2>
      <div className="header-buttons">
        <AudioControls
          isAudioEnabled={isAudioEnabled}
          toggleAudio={toggleAudio}
          audioData={audioData}
          error={error}
        />
        <button
          className="btn-launch-live"
          onClick={onLaunchLiveView}
          title="Open live view in new window"
        >
          Launch Live View
        </button>
        <button className="btn-add" onClick={onAddSurface}>
          + Add Surface
        </button>
      </div>
    </div>
  );
}
