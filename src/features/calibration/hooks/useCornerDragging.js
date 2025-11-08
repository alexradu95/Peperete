/**
 * useCornerDragging Hook
 *
 * Manages corner point dragging for surface calibration
 */
export function useCornerDragging(surface, updateSurfaceCorners) {
  /**
   * Handle corner point drag
   * @param {string} corner - Corner key (e.g., 'topLeft', 'bottomRight')
   * @param {Object} position - New position {x, y}
   */
  const handleCornerDrag = (corner, position) => {
    if (!surface) return;

    const newCorners = {
      ...surface.corners,
      [corner]: position
    };

    updateSurfaceCorners(surface.id, newCorners);
  };

  return { handleCornerDrag };
}
