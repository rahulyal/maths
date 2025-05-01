import { z } from "zod";

// Base types
export const Vector2D = z.object({
  x: z.number(),
  y: z.number(),
});

export const Transform = z.object({
  position: Vector2D,
  rotation: z.number().default(0),
  scale: Vector2D.default({ x: 1, y: 1 }),
});

export const RenderStyle = z.object({
  fillStyle: z.string().default("#000000"),
  strokeStyle: z.string().default("#000000"),
  lineWidth: z.number().default(1),
  alpha: z.number().min(0).max(1).default(1),
});

export const CanvasConfig = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
  dpi: z.number().positive().default(2),
  backgroundColor: z.string().default("#ffffff"),
});

export const Color = z.object({
  r: z.number().min(0).max(255),
  g: z.number().min(0).max(255),
  b: z.number().min(0).max(255),
  a: z.number().min(0).max(1).default(1),
}).default({ r: 0, g: 0, b: 0, a: 1 });

// Export types
export type Vector2D = z.infer<typeof Vector2D>;
export type Transform = z.infer<typeof Transform>;
export type RenderStyle = z.infer<typeof RenderStyle>;
export type CanvasConfig = z.infer<typeof CanvasConfig>;
