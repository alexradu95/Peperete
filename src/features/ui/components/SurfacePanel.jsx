import React, { useState } from 'react';
import { useSurfaces } from '../../surface-manager/context/SurfaceContext';
import { useApp } from '../../../shared/context/AppContext';
import { useAudio } from '../../../shared/context/AudioContext';
import { CONTENT_TYPES, APP_MODES } from '../../../shared/utils/constants';
import { GeometryTypeModal } from './GeometryTypeModal';
import { ShaderEditorPanel } from './ShaderEditorPanel';
import { getTemplate } from '../../scene/materials/shaderTemplates';

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
  const { isAudioEnabled, toggleAudio, audioData, error } = useAudio();
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
      <div className={`fixed left-0 top-0 w-[300px] h-screen bg-[rgba(20,20,20,0.95)] text-white flex flex-col z-[1000] border-r border-white/10 transition-transform duration-300 ease-in-out ${!isSidebarVisible ? '-translate-x-full' : ''}`}>
        <div className="p-5 border-b border-white/10">
          <h2 className="m-0 mb-4 text-lg font-semibold">Surfaces</h2>
          <div className="flex flex-col gap-2">
            <button
              className={`w-full px-2.5 py-2.5 ${isAudioEnabled ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-gray-600 hover:bg-gray-500'} text-white border-none rounded cursor-pointer text-sm font-medium transition-colors`}
              onClick={toggleAudio}
              title={isAudioEnabled ? 'Disable microphone' : 'Enable microphone'}
            >
              {isAudioEnabled ? '🎤 Audio ON' : '🎤 Audio OFF'}
            </button>
            <button className="w-full px-2.5 py-2.5 bg-green-600 hover:bg-green-700 text-white border-none rounded cursor-pointer text-sm font-medium transition-colors" onClick={handleLaunchLiveView} title="Open live view in new window">
              Launch Live View
            </button>
            <button className="w-full px-2.5 py-2.5 bg-[#00aaff] hover:bg-[#0088cc] text-white border-none rounded cursor-pointer text-sm font-medium transition-colors" onClick={handleAddSurface}>
              + Add Surface
            </button>
          </div>
        </div>

        {isAudioEnabled && (
          <div className="py-4 px-5 bg-black/30 border-b border-white/10">
            <div className="mb-2.5 last:mb-0">
              <div className="text-[11px] text-white/70 mb-1 font-medium">Bass</div>
              <div className="h-2 bg-white/10 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00aaff] to-[#00ff88] transition-[width] duration-100 ease-out rounded" style={{ width: `${audioData.bass * 100}%` }} />
              </div>
            </div>
            <div className="mb-2.5 last:mb-0">
              <div className="text-[11px] text-white/70 mb-1 font-medium">Mid</div>
              <div className="h-2 bg-white/10 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00aaff] to-[#00ff88] transition-[width] duration-100 ease-out rounded" style={{ width: `${audioData.mid * 100}%` }} />
              </div>
            </div>
            <div className="mb-2.5 last:mb-0">
              <div className="text-[11px] text-white/70 mb-1 font-medium">Treble</div>
              <div className="h-2 bg-white/10 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00aaff] to-[#00ff88] transition-[width] duration-100 ease-out rounded" style={{ width: `${audioData.treble * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="py-2.5 px-5 bg-red-500/20 border-b border-red-500/30 text-red-200 text-xs">
            Error: {error}
          </div>
        )}

      <div className="flex-1 overflow-y-auto p-2.5 custom-scrollbar">
        {surfaces.length === 0 ? (
          <div className="py-10 px-5 text-center text-white/50">
            <p className="my-2.5">No surfaces yet</p>
            <p className="text-xs my-2.5">Click "Add Surface" to create one</p>
          </div>
        ) : (
          surfaces.map(surface => (
            <div
              key={surface.id}
              className={`bg-white/5 border border-white/10 rounded mb-2 p-3 cursor-pointer transition-all ${selectedSurfaceId === surface.id ? 'bg-[rgba(0,170,255,0.1)] border-[#00aaff]' : 'hover:bg-white/8 hover:border-white/20'} ${!surface.visible ? 'opacity-50' : ''}`}
              onClick={() => handleSelectSurface(surface.id)}
            >
              <div className="flex justify-between items-center gap-2.5">
                <input
                  type="text"
                  className="flex-1 bg-transparent border border-transparent text-white px-2 py-1 text-sm rounded hover:border-white/20 focus:outline-none focus:border-[#00aaff] focus:bg-black/30"
                  value={surface.name}
                  onChange={(e) => handleNameChange(surface.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex gap-1.5">
                  <button
                    className="bg-transparent border-none text-white cursor-pointer px-2 py-1 rounded text-base transition-colors hover:bg-white/10"
                    onClick={(e) => handleToggleVisibility(surface.id, e)}
                    title={surface.visible ? 'Hide' : 'Show'}
                  >
                    {surface.visible ? '👁' : '👁‍🗨'}
                  </button>
                  <button
                    className="bg-transparent border-none text-white cursor-pointer px-2 py-1 rounded text-xl leading-none transition-colors hover:bg-red-500/20 hover:text-red-400"
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
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="mb-4">
                    <label className="block text-xs text-white/70 mb-1.5 font-medium">Content Type</label>
                    <select
                      className="w-full px-2 py-2 bg-black/30 border border-white/20 rounded text-white text-[13px] focus:outline-none focus:border-[#00aaff]"
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
                    <div className="mb-4">
                      <button
                        className="w-full px-2.5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white border-none rounded cursor-pointer text-sm font-medium transition-colors"
                        onClick={() => handleOpenShaderEditor(surface.id)}
                      >
                        ✏️ Edit Shader
                      </button>
                    </div>
                  )}

                  {surface.contentType === CONTENT_TYPES.IMAGE && (
                    <div className="mb-4">
                      <label className="block text-xs text-white/70 mb-1.5 font-medium">Upload Image</label>
                      <input
                        className="w-full px-1.5 py-1.5 bg-black/30 border border-white/20 rounded text-white text-xs"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(surface.id, e)}
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-xs text-white/70 mb-1.5 font-medium">Render Order (Z-Index)</label>
                    <input
                      className="w-full px-2 py-2 bg-black/30 border border-white/20 rounded text-white text-[13px] focus:outline-none focus:border-[#00aaff]"
                      type="number"
                      value={surface.renderOrder || 0}
                      onChange={(e) => handleRenderOrderChange(surface.id, e.target.value)}
                      min="0"
                      max="100"
                    />
                    <small className="block mt-1.5 text-[11px] text-white/50">Higher values render on top</small>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

        <div className="py-4 px-5 border-t border-white/10 text-xs text-white/60">
          <div className="text-center">
            {surfaces.length} surface{surfaces.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </>
  );
}
