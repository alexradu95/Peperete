import React, { useState } from 'react';
import { useSurfaces } from '../../surface-manager/context/SurfaceContext';
import { useApp } from '../../../shared/context/AppContext';
import { useAudio } from '../../../shared/context/AudioContext';
import { CONTENT_TYPES, APP_MODES } from '../../../shared/utils/constants';
import { GeometryTypeModal } from './GeometryTypeModal';
import './SurfacePanel.css';

/**
 * Surface Panel Component
 * Left sidebar for managing surfaces
 */
export function SurfacePanel() {
  const {
    getAllSurfaces,
    selectedSurfaceId,
    setSelectedSurfaceId,
    addSurface,
    removeSurface,
    updateSurface,
    toggleSurfaceVisibility,
    updateSurfaceContent
  } = useSurfaces();

  const { mode, showNotification } = useApp();
  const { isAudioEnabled, toggleAudio, audioData, error } = useAudio();
  const surfaces = getAllSurfaces();
  const [showGeometryModal, setShowGeometryModal] = useState(false);

  const handleAddSurface = () => {
    setShowGeometryModal(true);
  };

  const handleGeometrySelect = (geometryType, cornerCount) => {
    const id = addSurface({ geometryType, cornerCount });
    showNotification('Surface added');
  };

  const handleRemoveSurface = (id) => {
    if (window.confirm('Are you sure you want to delete this surface?')) {
      removeSurface(id);
      showNotification('Surface removed');
    }
  };

  const handleSelectSurface = (id) => {
    setSelectedSurfaceId(id);
  };

  const handleToggleVisibility = (id, e) => {
    e.stopPropagation();
    toggleSurfaceVisibility(id);
  };

  const handleNameChange = (id, name) => {
    updateSurface(id, { name });
  };

  const handleContentTypeChange = (id, contentType) => {
    updateSurfaceContent(id, contentType);
  };

  const handleRenderOrderChange = (id, renderOrder) => {
    updateSurface(id, { renderOrder: parseInt(renderOrder) });
  };

  const handleImageUpload = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateSurfaceContent(id, CONTENT_TYPES.IMAGE, { imageUrl: event.target.result });
        showNotification('Image loaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLaunchLiveView = () => {
    // Open live view in a new window/tab
    const liveViewUrl = `${window.location.origin}/live`;
    window.open(liveViewUrl, '_blank', 'width=1920,height=1080');
    showNotification('Live view launched');
  };

  return (
    <>
      <GeometryTypeModal
        isOpen={showGeometryModal}
        onClose={() => setShowGeometryModal(false)}
        onSelect={handleGeometrySelect}
      />

      <div className="surface-panel">
        <div className="surface-panel-header">
          <h2>Surfaces</h2>
          <div className="header-buttons">
            <button
              className={`btn-audio ${isAudioEnabled ? 'active' : ''}`}
              onClick={toggleAudio}
              title={isAudioEnabled ? 'Disable microphone' : 'Enable microphone'}
            >
              {isAudioEnabled ? '🎤 Audio ON' : '🎤 Audio OFF'}
            </button>
            <button className="btn-launch-live" onClick={handleLaunchLiveView} title="Open live view in new window">
              Launch Live View
            </button>
            <button className="btn-add" onClick={handleAddSurface}>
              + Add Surface
            </button>
          </div>
        </div>

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

      <div className="surface-list">
        {surfaces.length === 0 ? (
          <div className="empty-state">
            <p>No surfaces yet</p>
            <p className="help-text">Click "Add Surface" to create one</p>
          </div>
        ) : (
          surfaces.map(surface => (
            <div
              key={surface.id}
              className={`surface-item ${selectedSurfaceId === surface.id ? 'selected' : ''} ${!surface.visible ? 'hidden' : ''}`}
              onClick={() => handleSelectSurface(surface.id)}
            >
              <div className="surface-item-header">
                <input
                  type="text"
                  className="surface-name"
                  value={surface.name}
                  onChange={(e) => handleNameChange(surface.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="surface-controls">
                  <button
                    className={`btn-visibility ${surface.visible ? 'visible' : 'hidden'}`}
                    onClick={(e) => handleToggleVisibility(surface.id, e)}
                    title={surface.visible ? 'Hide' : 'Show'}
                  >
                    {surface.visible ? '👁' : '👁‍🗨'}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSurface(surface.id);
                    }}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>

              {selectedSurfaceId === surface.id && (
                <div className="surface-details">
                  <div className="form-group">
                    <label>Content Type</label>
                    <select
                      value={surface.contentType}
                      onChange={(e) => handleContentTypeChange(surface.id, e.target.value)}
                    >
                      <optgroup label="Calibration Patterns">
                        <option value={CONTENT_TYPES.CHECKERBOARD}>Checkerboard</option>
                        <option value={CONTENT_TYPES.GRID}>Grid with Numbers</option>
                      </optgroup>
                      <optgroup label="Shader Effects">
                        <option value={CONTENT_TYPES.ANIMATED_GRADIENT}>Animated Gradient</option>
                        <option value={CONTENT_TYPES.ROTATING_COLORS}>Rotating Colors</option>
                        <option value={CONTENT_TYPES.PLASMA}>Plasma</option>
                        <option value={CONTENT_TYPES.WAVES}>Waves</option>
                        <option value={CONTENT_TYPES.NOISE}>Noise Pattern</option>
                        <option value={CONTENT_TYPES.FIRE}>Fire</option>
                        <option value={CONTENT_TYPES.RAINBOW}>Rainbow Spectrum</option>
                        <option value={CONTENT_TYPES.KALEIDOSCOPE}>Kaleidoscope</option>
                        <option value={CONTENT_TYPES.GLITCH}>Glitch</option>
                        <option value={CONTENT_TYPES.SPIRAL}>Spiral</option>
                      </optgroup>
                      <optgroup label="Audio-Reactive Effects">
                        <option value={CONTENT_TYPES.AUDIO_WAVES}>Audio Waves</option>
                        <option value={CONTENT_TYPES.AUDIO_PULSE}>Audio Pulse</option>
                        <option value={CONTENT_TYPES.AUDIO_SPECTRUM}>Audio Spectrum</option>
                        <option value={CONTENT_TYPES.AUDIO_BARS}>Audio Bars</option>
                      </optgroup>
                      <optgroup label="Solid Colors">
                        <option value={CONTENT_TYPES.WHITE}>White</option>
                        <option value={CONTENT_TYPES.RED}>Red</option>
                        <option value={CONTENT_TYPES.GREEN}>Green</option>
                        <option value={CONTENT_TYPES.BLUE}>Blue</option>
                      </optgroup>
                      <optgroup label="Custom">
                        <option value={CONTENT_TYPES.IMAGE}>Image</option>
                      </optgroup>
                    </select>
                  </div>

                  {surface.contentType === CONTENT_TYPES.IMAGE && (
                    <div className="form-group">
                      <label>Upload Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(surface.id, e)}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Render Order (Z-Index)</label>
                    <input
                      type="number"
                      value={surface.renderOrder || 0}
                      onChange={(e) => handleRenderOrderChange(surface.id, e.target.value)}
                      min="0"
                      max="100"
                    />
                    <small>Higher values render on top</small>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

        <div className="surface-panel-footer">
          <div className="surface-count">
            {surfaces.length} surface{surfaces.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </>
  );
}
