import { useState } from 'react';
import { CONTENT_TYPES } from '../../../shared/constants';
import { getTemplate } from '../../materials/custom/shaderTemplates';

/**
 * useSurfacePanel Hook
 *
 * Manages all event handlers and state for the SurfacePanel component
 * Consolidates surface operations, shader editor, and modal management
 */
export function useSurfacePanel({
  addSurface,
  removeSurface,
  updateSurface,
  updateSurfaceContent,
  setSelectedSurfaceId,
  toggleSurfaceVisibility,
  showNotification
}) {
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

  return {
    // State
    showGeometryModal,
    setShowGeometryModal,
    showShaderEditor,
    editingShaderSurfaceId,

    // Handlers
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
  };
}
