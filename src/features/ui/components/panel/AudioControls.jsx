import React from 'react';

/**
 * AudioControls Component
 *
 * Displays audio toggle button and real-time audio meters
 * for bass, mid, and treble frequencies
 */
export function AudioControls({ isAudioEnabled, toggleAudio, audioData, error }) {
  return (
    <>
      <button
        className={`btn-audio ${isAudioEnabled ? 'active' : ''}`}
        onClick={toggleAudio}
        title={isAudioEnabled ? 'Disable microphone' : 'Enable microphone'}
      >
        {isAudioEnabled ? '🎤 Audio ON' : '🎤 Audio OFF'}
      </button>

      {isAudioEnabled && (
        <div className="audio-status">
          <div className="audio-meter">
            <div className="meter-label">Bass</div>
            <div className="meter-bar">
              <div className="meter-fill" style={{ width: `${audioData.bass * 100}%` }} />
            </div>
          </div>
          <div className="audio-meter">
            <div className="meter-label">Mid</div>
            <div className="meter-bar">
              <div className="meter-fill" style={{ width: `${audioData.mid * 100}%` }} />
            </div>
          </div>
          <div className="audio-meter">
            <div className="meter-label">Treble</div>
            <div className="meter-bar">
              <div className="meter-fill" style={{ width: `${audioData.treble * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="audio-error">
          Error: {error}
        </div>
      )}
    </>
  );
}
