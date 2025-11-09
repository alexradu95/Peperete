import React, { useState } from 'react';
import { GEOMETRY_TYPES } from '../../../shared/utils/constants';

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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] animate-fadeIn" onClick={onClose}>
      <div className="bg-[#2a2a2a] rounded-xl p-0 max-w-[600px] w-[90%] max-h-[90vh] overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="py-5 px-6 border-b border-[#444] flex justify-between items-center">
          <h2 className="m-0 text-xl text-white">Create New Surface</h2>
          <button className="bg-transparent border-none text-[28px] text-[#999] hover:bg-[#444] hover:text-white cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded transition-all" onClick={onClose}>×</button>
        </div>

        <div className="p-6">
          <p className="my-0 mb-5 text-[#ccc] text-sm">
            Choose the number of corners for your projection surface:
          </p>

          <div className="text-center py-8 my-5 bg-[#333] rounded-lg border-2 border-[#4a9eff]">
            <div className="text-2xl font-semibold text-[#4a9eff] mb-2">{getShapeName(cornerCount)}</div>
            <div className="text-base text-[#ccc]">{cornerCount} corners</div>
          </div>

          <div className="bg-[#333] rounded-lg p-5 mt-5">
            <label className="block mb-3 text-[#ccc] text-sm">
              Number of Corners
            </label>
            <input
              type="range"
              min="3"
              max="8"
              value={cornerCount}
              onChange={(e) => setCornerCount(parseInt(e.target.value))}
              className="w-full mb-2"
            />
            <div className="flex justify-between px-2 text-xs text-[#666]">
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
            </div>
          </div>
        </div>

        <div className="py-4 px-6 border-t border-[#444] flex justify-end gap-3">
          <button className="px-5 py-2.5 rounded-md border-none text-sm font-medium cursor-pointer transition-all bg-[#444] hover:bg-[#555] text-white" onClick={onClose}>
            Cancel
          </button>
          <button className="px-5 py-2.5 rounded-md border-none text-sm font-medium cursor-pointer transition-all bg-[#4a9eff] hover:bg-[#357abd] text-white" onClick={handleSubmit}>
            Create Surface
          </button>
        </div>
      </div>
    </div>
  );
}
