import { z } from 'zod';

// App Mode Schema
export const AppModeSchema = z.enum(['calibration', 'playback']);
export type AppMode = z.infer<typeof AppModeSchema>;

// Content Type Schema
export const ContentTypeSchema = z.enum([
  'checkerboard',
  'grid',
  'animated-gradient',
  'rotating-colors',
  'plasma',
  'waves',
  'noise',
  'fire',
  'rainbow',
  'kaleidoscope',
  'glitch',
  'spiral',
  'custom-shader',
  'white',
  'red',
  'green',
  'blue',
  'image',
  'audio-waves',
  'audio-pulse',
  'audio-spectrum',
  'audio-bars'
]);
export type ContentType = z.infer<typeof ContentTypeSchema>;

// Geometry Type Schema
export const GeometryTypeSchema = z.enum(['polygon']);
export type GeometryType = z.infer<typeof GeometryTypeSchema>;

// Corner Point Schema
export const CornerPointSchema = z.object({
  x: z.number(),
  y: z.number()
});
export type CornerPoint = z.infer<typeof CornerPointSchema>;

// Corners Schema (dynamic keys for point0, point1, etc.)
export const CornersSchema = z.record(z.string(), CornerPointSchema);
export type Corners = z.infer<typeof CornersSchema>;

// Content Data Schema
export const ContentDataSchema = z.object({
  imageUrl: z.string().optional(),
  shaderData: z.record(z.unknown()).optional()
}).optional();
export type ContentData = z.infer<typeof ContentDataSchema>;

// Surface Schema
export const SurfaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  contentType: ContentTypeSchema,
  contentData: ContentDataSchema,
  geometryType: GeometryTypeSchema,
  cornerCount: z.number().int().min(3).max(8),
  corners: CornersSchema,
  visible: z.boolean(),
  renderOrder: z.number().int(),
  audioReactive: z.boolean().optional()
});
export type Surface = z.infer<typeof SurfaceSchema>;

// Surface Array Schema
export const SurfaceArraySchema = z.array(SurfaceSchema);
export type SurfaceArray = z.infer<typeof SurfaceArraySchema>;

// App State Schema
export const AppStateSchema = z.object({
  mode: AppModeSchema,
  isFullscreen: z.boolean(),
  isSidebarVisible: z.boolean()
});
export type AppState = z.infer<typeof AppStateSchema>;

// Parse functions for runtime validation
export const parseSurface = (data: unknown): Surface => {
  return SurfaceSchema.parse(data);
};

export const parseSurfaceArray = (data: unknown): SurfaceArray => {
  return SurfaceArraySchema.parse(data);
};

export const parseAppState = (data: unknown): AppState => {
  return AppStateSchema.parse(data);
};

// Safe parse functions that return results instead of throwing
export const safeParseSurface = (data: unknown) => {
  return SurfaceSchema.safeParse(data);
};

export const safeParseSurfaceArray = (data: unknown) => {
  return SurfaceArraySchema.safeParse(data);
};

export const safeParseAppState = (data: unknown) => {
  return AppStateSchema.safeParse(data);
};
