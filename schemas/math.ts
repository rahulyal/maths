import { z } from "zod";
import { Color, Vector2D } from "./canvas.ts";

// Grid Configuration
export const GridConfig = z.object({
  size: z.number().positive().default(20),
  lineWidth: z.number().positive().default(0.5),
  color: Color.default({ r: 200, g: 200, b: 200, a: 1 }),
  majorLines: z.object({
    frequency: z.number().positive().default(5),
    lineWidth: z.number().positive().default(1),
    color: Color.default({ r: 150, g: 150, b: 150, a: 1 }),
  }),
});

// Math Equation
export const MathEquation = z.object({
  latex: z.string(),
  position: Vector2D,
  fontSize: z.number().positive().default(24),
  color: Color.default({ r: 0, g: 0, b: 0, a: 1 }),
  animationDuration: z.number().default(1000), // ms for handwritten effect
});

// Function Graph
export const FunctionGraph = z.object({
  expression: z.string(), // e.g., "sin(x)", "x^2"
  domain: z.object({
    min: z.number(),
    max: z.number(),
  }),
  range: z.object({
    min: z.number(),
    max: z.number(),
  }),
  color: Color.default({ r: 0, g: 0, b: 255, a: 1 }),
  lineWidth: z.number().positive().default(2),
  style: z.enum(["solid", "dashed", "handwritten"]).default("handwritten"),
});

// Geometric Shape
export const GeometricShape = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("point"),
    position: Vector2D,
    radius: z.number().positive().default(3),
    color: Color,
  }),
  z.object({
    type: z.literal("circle"),
    center: Vector2D,
    radius: z.number().positive(),
    fill: z.boolean().default(false),
    color: Color,
  }),
  z.object({
    type: z.literal("rectangle"),
    position: Vector2D,
    width: z.number().positive(),
    height: z.number().positive(),
    fill: z.boolean().default(false),
    color: Color,
  }),
  z.object({
    type: z.literal("arrow"),
    start: Vector2D,
    end: Vector2D,
    headSize: z.number().positive().default(10),
    color: Color,
  }),
]);

// Export types
export type GridConfig = z.infer<typeof GridConfig>;
export type MathEquation = z.infer<typeof MathEquation>;
export type FunctionGraph = z.infer<typeof FunctionGraph>;
export type GeometricShape = z.infer<typeof GeometricShape>;
