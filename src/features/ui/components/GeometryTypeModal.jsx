import React, { useState } from 'react';
import { GEOMETRY_TYPES } from '../../../shared/constants';
import './GeometryTypeModal.css';

/**
 * Geometry Type Modal Component
 * Modal dialog for selecting the number of corners for a polygon
 */
export function GeometryTypeModal({ isOpen, onClose, onSelect }) {
  const [cornerCount, setCornerCount] = useState(4);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSelect(GEOMETRY_TYPES.POLYGON, cornerCount);
    onClose();
  };

  const getShapeName = (count) => {
    switch (count) {
      case 3: return 'Triangle';
      case 4: return 'Quadrilateral';
      case 5: return 'Pentagon';
      case 6: return 'Hexagon';
      case 7: return 'Heptagon';
      case 8: return 'Octagon';
      default: return `${count}-sided Polygon`;
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
            Choose the number of corners for your projection surface:
          </p>

          <div className="shape-preview">
            <div className="shape-name">{getShapeName(cornerCount)}</div>
            <div className="corner-count-display">{cornerCount} corners</div>
          </div>

          <div className="custom-options">
            <label>
              Number of Corners
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
