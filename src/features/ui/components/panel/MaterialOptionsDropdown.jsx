import React, { useMemo } from 'react';
import { MaterialRegistry } from '../../../../core/materials/MaterialRegistry';

/**
 * MaterialOptionsDropdown Component
 * Dynamically generates dropdown options from MaterialRegistry
 * Organized by category with optgroups
 */
export function MaterialOptionsDropdown() {
  const materialsByCategory = useMemo(() => {
    return MaterialRegistry.getAllByCategory();
  }, []);

  // Category display names mapping
  const categoryLabels = {
    basic: 'Basic Patterns',
    animated: 'Animated Effects',
    audio: 'Audio Reactive',
    custom: 'Custom'
  };

  // Category order for display
  const categoryOrder = ['basic', 'animated', 'audio', 'custom'];

  return (
    <>
      {categoryOrder.map(category => {
        const materials = materialsByCategory[category];
        if (!materials || materials.length === 0) return null;

        return (
          <optgroup key={category} label={categoryLabels[category] || category}>
            {materials.map(material => (
              <option key={material.id} value={material.id}>
                {material.name}
              </option>
            ))}
          </optgroup>
        );
      })}
    </>
  );
}
