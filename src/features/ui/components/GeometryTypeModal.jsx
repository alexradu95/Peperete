import React, { useState } from 'react';
import { GEOMETRY_TYPES } from '../../../shared/utils/constants';
import './GeometryTypeModal.css';

/**
 * Geometry Type Modal Component
 * Modal dialog for selecting the type of geometric plane to create
 */
export function GeometryTypeModal({ isOpen, onClose, onSelect }) {
  const [selectedType, setSelectedType] = useState(GEOMETRY_TYPES.RECTANGLE);
  const [cornerCount, setCornerCount] = useState(4);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSelect(selectedType, cornerCount);
    onClose();
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);

    // Set default corner counts based on type
    switch (type) {
      case GEOMETRY_TYPES.TRIANGLE:
        setCornerCount(3);
        break;
      case GEOMETRY_TYPES.RECTANGLE:
        setCornerCount(4);
        break;
      case GEOMETRY_TYPES.CIRCLE:
        setCornerCount(8);
        break;
      case GEOMETRY_TYPES.CUSTOM:
        setCornerCount(4);
        break;
      default:
        setCornerCount(4);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Surface</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Select the type of geometric plane you want to create:
          </p>

          <div className="geometry-types">
            <div
              className={`geometry-type-card ${selectedType === GEOMETRY_TYPES.RECTANGLE ? 'selected' : ''}`}
              onClick={() => handleTypeChange(GEOMETRY_TYPES.RECTANGLE)}
            >
              <div className="geometry-icon">▭</div>
              <h3>Rectangle</h3>
              <p>Standard 4-corner quadrilateral</p>
            </div>

            <div
              className={`geometry-type-card ${selectedType === GEOMETRY_TYPES.TRIANGLE ? 'selected' : ''}`}
              onClick={() => handleTypeChange(GEOMETRY_TYPES.TRIANGLE)}
            >
              <div className="geometry-icon">△</div>
              <h3>Triangle</h3>
              <p>3-corner triangular shape</p>
            </div>

            <div
              className={`geometry-type-card ${selectedType === GEOMETRY_TYPES.CIRCLE ? 'selected' : ''}`}
              onClick={() => handleTypeChange(GEOMETRY_TYPES.CIRCLE)}
            >
              <div className="geometry-icon">○</div>
              <h3>Circle</h3>
              <p>8-point circular shape</p>
            </div>

            <div
              className={`geometry-type-card ${selectedType === GEOMETRY_TYPES.CUSTOM ? 'selected' : ''}`}
              onClick={() => handleTypeChange(GEOMETRY_TYPES.CUSTOM)}
            >
              <div className="geometry-icon">⬡</div>
              <h3>Custom</h3>
              <p>Custom polygon (3-8 corners)</p>
            </div>
          </div>

          {selectedType === GEOMETRY_TYPES.CUSTOM && (
            <div className="custom-options">
              <label>
                Number of Corners: <strong>{cornerCount}</strong>
              </label>
              <input
                type="range"
                min="3"
                max="8"
                value={cornerCount}
                onChange={(e) => setCornerCount(parseInt(e.target.value))}
                className="corner-count-slider"
              />
              <div className="corner-count-labels">
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            Create Surface
          </button>
        </div>
      </div>
    </div>
  );
}
