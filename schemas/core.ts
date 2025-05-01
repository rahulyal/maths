import { z } from "zod";

export const Vector2D = z.object({
  x: z.number(),
  y: z.number(),
});

export const Color = z.object({
  r: z.number().min(0).max(255),
  g: z.number().min(0).max(255),
  b: z.number().min(0).max(255),
  a: z.number().min(0).max(1).default(1),
});

export const Point = Vector2D;
export const Size = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});

export type Vector2D = z.infer<typeof Vector2D>;
export type Color = z.infer<typeof Color>;
export type Point = z.infer<typeof Point>;
export type Size = z.infer<typeof Size>;
