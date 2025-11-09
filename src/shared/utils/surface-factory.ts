import type { Surface, ContentType, Corners } from '../schemas';

type CreateSurfaceOptions = {
  id: string;
  name?: string;
  contentType?: ContentType;
  cornerCount?: number;
  visible?: boolean;
  renderOrder?: number;
  audioReactive?: boolean;
};

type CreateSurfaceWithCornersOptions = CreateSurfaceOptions & {
  corners: Corners;
};

const getDefaultCorners = (cornerCount: number): Corners => {
  const centerX = 400;
  const centerY = 300;
  const radius = 200;

  const corners: Corners = {};
  for (let i = 0; i < cornerCount; i++) {
    const angle = (i / cornerCount) * Math.PI * 2 - Math.PI / 2;
    corners[`point${i}`] = {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  }
  return corners;
};

export const createDefaultSurface = (options: CreateSurfaceOptions): Surface => {
  const {
    id,
    name = 'Surface',
    contentType = 'checkerboard',
    cornerCount = 4,
    visible = true,
    renderOrder = 0,
    audioReactive = false
  } = options;

  return {
    id,
    name,
    contentType,
    contentData: undefined,
    geometryType: 'polygon',
    cornerCount,
    corners: getDefaultCorners(cornerCount),
    visible,
    renderOrder,
    audioReactive
  };
};

export const createSurfaceWithCorners = (
  options: CreateSurfaceWithCornersOptions
): Surface => {
  const { corners, ...restOptions } = options;
  const cornerCount = Object.keys(corners).length;

  const surface = createDefaultSurface({
    ...restOptions,
    cornerCount
  });

  return {
    ...surface,
    corners
  };
};
