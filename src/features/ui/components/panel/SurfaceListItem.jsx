import React from 'react';
import { CONTENT_TYPES } from '../../../../shared/constants';
import { MaterialOptionsDropdown } from './MaterialOptionsDropdown';

/**
 * SurfaceListItem Component
 *
 * Renders an individual surface item with:
 * - Name input
 * - Visibility toggle
 * - Delete button
 * - Expandable details (when selected)
 */
export function SurfaceListItem({
  surface,
  isSelected,
  onSelect,
  onNameChange,
  onToggleVisibility,
  onRemove,
  onContentTypeChange,
  onOpenShaderEditor,
  onImageUpload,
  onRenderOrderChange
}) {
  return (
    <div
      className={`surface-item ${isSelected ? 'selected' : ''} ${!surface.visible ? 'hidden' : ''}`}
      onClick={() => onSelect(surface.id)}
    >
      <div className="surface-item-header">
        <input
          type="text"
          className="surface-name"
          value={surface.name}
          onChange={(e) => onNameChange(surface.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="surface-controls">
          <button
            className={`btn-visibility ${surface.visible ? 'visible' : 'hidden'}`}
            onClick={(e) => onToggleVisibility(surface.id, e)}
            title={surface.visible ? 'Hide' : 'Show'}
          >
            {surface.visible ? '👁' : '👁‍🗨'}
          </button>
          <button
            className="btn-delete"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(surface.id);
            }}
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>

      {isSelected && (
        <div className="surface-details">
          <div className="form-group">
            <label>Content Type</label>
            <select
              value={surface.contentType}
              onChange={(e) => onContentTypeChange(surface.id, e.target.value)}
            >
              <MaterialOptionsDropdown />
            </select>
          </div>

          {surface.contentType === CONTENT_TYPES.CUSTOM_SHADER && (
            <div className="form-group">
              <button
                className="btn-shader-editor"
                onClick={() => onOpenShaderEditor(surface.id)}
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
                onChange={(e) => onImageUpload(surface.id, e)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Render Order (Z-Index)</label>
            <input
              type="number"
              value={surface.renderOrder || 0}
              onChange={(e) => onRenderOrderChange(surface.id, e.target.value)}
              min="0"
              max="100"
            />
            <small>Higher values render on top</small>
          </div>
        </div>
      )}
    </div>
  );
}
