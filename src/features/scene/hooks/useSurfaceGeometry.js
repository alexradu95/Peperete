import { useMemo, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { GeometryGenerator } from '../../../core/geometry/GeometryGenerator';
import { TransformCalculator } from '../../../core/transformation/TransformCalculator';
import { GEOMETRY_SUBDIVISIONS, GEOMETRY_TYPES } from '../../../shared/constants';

/**
 * useSurfaceGeometry Hook
 *
 * Manages geometry creation and perspective transformation for a surface
 * - Creates geometry based on geometry type and corner count
 * - Applies perspective transformation when corners change or window resizes
 */
export function useSurfaceGeometry(surface, meshRef) {
  const { size } = useThree();

  // Create geometry based on geometry type
  const geometry = useMemo(() => {
    const geom = GeometryGenerator.createGeometry(
      surface.geometryType || GEOMETRY_TYPES.POLYGON,
      surface.cornerCount || 4,
      GEOMETRY_SUBDIVISIONS
    );
    return geom;
  }, [surface.geometryType, surface.cornerCount]);

  // Apply perspective transformation to geometry when corners change OR window resizes
  useEffect(() => {
    if (meshRef.current && surface.corners) {
      TransformCalculator.applyTransformToGeometry(
        geometry,
        surface.corners,
        surface.geometryType || GEOMETRY_TYPES.POLYGON
      );
    }
  }, [surface.corners, geometry, surface.geometryType, size.width, size.height, meshRef]);

  return geometry;
}
