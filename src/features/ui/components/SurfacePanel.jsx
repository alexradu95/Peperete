import React from 'react';
import { useSurfaces } from '../../surface-manager/context/SurfaceContext';
import { useApp } from '../../../shared/context/AppContext';
import { useAudio } from '../../../shared/context/AudioContext';
import { GeometryTypeModal } from './GeometryTypeModal';
import { ShaderEditorPanel } from './ShaderEditorPanel';
import { PanelHeader, SurfaceListItem } from './panel';
import { useSurfacePanel } from '../hooks/useSurfacePanel';
import './SurfacePanel.css';

/**
 * Surface Panel Component
 * Left sidebar for managing surfaces
 *
 * REFACTORED: Reduced from 330 lines to ~120 lines
 * Extracted hook: useSurfacePanel
 * Extracted components: PanelHeader, SurfaceListItem, AudioControls, MaterialOptionsDropdown
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

  const { showNotification, isSidebarVisible } = useApp();
  const { isAudioEnabled, toggleAudio, audioData, error } = useAudio();
  const surfaces = getAllSurfaces();

  // Use custom hook for all event handlers
  const {
    showGeometryModal,
    setShowGeometryModal,
    showShaderEditor,
    editingShaderSurfaceId,
    handleAddSurface,
    handleGeometrySelect,
    handleRemoveSurface,
    handleSelectSurface,
    handleToggleVisibility,
    handleNameChange,
    handleContentTypeChange,
    handleOpenShaderEditor,
    handleShaderApply,
    handleShaderEditorClose,
    handleRenderOrderChange,
    handleImageUpload,
    handleLaunchLiveView
  } = useSurfacePanel({
    addSurface,
    removeSurface,
    updateSurface,
    updateSurfaceContent,
    setSelectedSurfaceId,
    toggleSurfaceVisibility,
    showNotification
  });

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
        <PanelHeader
          isAudioEnabled={isAudioEnabled}
          toggleAudio={toggleAudio}
          audioData={audioData}
          error={error}
          onLaunchLiveView={handleLaunchLiveView}
          onAddSurface={handleAddSurface}
        />

        <div className="surface-list">
          {surfaces.length === 0 ? (
            <div className="empty-state">
              <p>No surfaces yet</p>
              <p className="help-text">Click "Add Surface" to create one</p>
            </div>
          ) : (
            surfaces.map(surface => (
              <SurfaceListItem
                key={surface.id}
                surface={surface}
                isSelected={selectedSurfaceId === surface.id}
                onSelect={handleSelectSurface}
                onNameChange={handleNameChange}
                onToggleVisibility={handleToggleVisibility}
                onRemove={handleRemoveSurface}
                onContentTypeChange={handleContentTypeChange}
                onOpenShaderEditor={handleOpenShaderEditor}
                onImageUpload={handleImageUpload}
                onRenderOrderChange={handleRenderOrderChange}
              />
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
