import React, { useState } from 'react';
import { useSurfaces } from '../../surface-manager/context/SurfaceContext';
import { useApp } from '../../../shared/context/AppContext';
import { CONTENT_TYPES, APP_MODES } from '../../../shared/utils/constants';
import { GeometryTypeModal } from './GeometryTypeModal';
import { ShaderEditorPanel } from './ShaderEditorPanel';
import { getTemplate } from '../../scene/materials/shaderTemplates';
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

  const { mode, showNotification, isSidebarVisible } = useApp();
  const surfaces = getAllSurfaces();
  const [showGeometryModal, setShowGeometryModal] = useState(false);
  const [showShaderEditor, setShowShaderEditor] = useState(false);
  const [editingShaderSurfaceId, setEditingShaderSurfaceId] = useState(null);

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
    // If switching to custom shader, initialize with blank template
    if (contentType === CONTENT_TYPES.CUSTOM_SHADER) {
      const blankTemplate = getTemplate('BLANK');
      const shaderData = {
        vertexShader: blankTemplate.vertexShader,
        fragmentShader: blankTemplate.fragmentShader,
        uniforms: blankTemplate.uniforms
      };
      updateSurfaceContent(id, contentType, { shaderData });
      showNotification('Custom shader initialized - click "Edit Shader" to customize');
    } else {
      updateSurfaceContent(id, contentType);
    }
  };

  const handleOpenShaderEditor = (id) => {
    setEditingShaderSurfaceId(id);
    setShowShaderEditor(true);
  };

  const handleShaderApply = (shaderData) => {
    if (editingShaderSurfaceId) {
      updateSurfaceContent(editingShaderSurfaceId, CONTENT_TYPES.CUSTOM_SHADER, { shaderData });
      showNotification('Shader applied');
    }
  };

  const handleShaderEditorClose = () => {
    setShowShaderEditor(false);
    setEditingShaderSurfaceId(null);
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

  const currentSurface = surfaces.find(s => s.id === editingShaderSurfaceId);

  return (
    <>
      <GeometryTypeModal
        isOpen={showGeometryModal}
        onClose={() => setShowGeometryModal(false)}
        onSelect={handleGeometrySelect}
      />

      {showShaderEditor && (
        <ShaderEditorPanel
          surfaceId={editingShaderSurfaceId}
          initialShaderData={currentSurface?.contentData?.shaderData}
          onApply={handleShaderApply}
          onClose={handleShaderEditorClose}
        />
      )}
      <div className={`surface-panel ${!isSidebarVisible ? 'hidden' : ''}`}>
        <div className="surface-panel-header">
          <h2>Surfaces</h2>
          <div className="header-buttons">
            <button className="btn-launch-live" onClick={handleLaunchLiveView} title="Open live view in new window">
              Launch Live View
            </button>
            <button className="btn-add" onClick={handleAddSurface}>
              + Add Surface
            </button>
          </div>
        </div>

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
                        <option value={CONTENT_TYPES.CUSTOM_SHADER}>🎨 Custom Shader (Edit in Real-time)</option>
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

                  {surface.contentType === CONTENT_TYPES.CUSTOM_SHADER && (
                    <div className="form-group">
                      <button
                        className="btn-shader-editor"
                        onClick={() => handleOpenShaderEditor(surface.id)}
                      >
                        ✏️ Edit Shader
                      </button>
                    </div>
                  )}

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
