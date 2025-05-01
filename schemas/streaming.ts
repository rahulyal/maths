import { z } from "zod";
import { Color, Vector2D } from "./canvas.ts";

// Base command schema
export const StreamCommand = z.discriminatedUnion("type", [
  // Draw command for visual content
  z.object({
    type: z.literal("draw"),
    timestamp: z.number(),
    data: z.object({
      objectId: z.string(),
      operation: z.enum(["create", "update", "delete"]),
      objectType: z.enum(["equation", "graph", "shape", "annotation"]),
      params: z.object({
        // Common params
        position: Vector2D.optional(),
        color: Color.optional(),
        // Equation params
        latex: z.string().optional(),
        fontSize: z.number().optional(),
        // Graph params
        expression: z.string().optional(),
        domain: z.object({
          min: z.number(),
          max: z.number(),
        }).optional(),
        // Shape params
        width: z.number().optional(),
        height: z.number().optional(),
        radius: z.number().optional(),
      }),
    }),
  }),
  // Voice command for audio
  z.object({
    type: z.literal("voice"),
    timestamp: z.number(),
    data: z.object({
      text: z.string(),
      voice: z.string().optional(),
      duration: z.number().optional(),
    }),
  }),
  // Camera control
  z.object({
    type: z.literal("camera"),
    timestamp: z.number(),
    data: z.object({
      zoom: z.number().optional(),
      position: Vector2D.optional(),
      transition: z.object({
        duration: z.number(),
        easing: z.enum(["linear", "ease-in", "ease-out", "ease-in-out"]),
      }).optional(),
    }),
  }),
  // Scene control
  z.object({
    type: z.literal("scene"),
    timestamp: z.number(),
    data: z.object({
      sceneId: z.string(),
      transition: z.enum(["fade", "slide", "none"]).default("none"),
      duration: z.number().default(0),
    }),
  }),
]);

// Message envelope for communication
export const StreamMessage = z.object({
  id: z.string(),
  command: StreamCommand,
  metadata: z.object({
    clientId: z.string(),
    timestamp: z.number(),
    version: z.string().default("1.0"),
  }),
});

// Client connection state
export const ClientState = z.object({
  id: z.string(),
  connected: z.boolean(),
  lastActive: z.number(),
  permissions: z.array(z.enum(["read", "write", "admin"])),
});

// Scene definition
export const Scene = z.object({
  id: z.string(),
  name: z.string(),
  commands: z.array(StreamCommand),
  duration: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

// Export types
export type StreamCommand = z.infer<typeof StreamCommand>;
export type StreamMessage = z.infer<typeof StreamMessage>;
export type ClientState = z.infer<typeof ClientState>;
export type Scene = z.infer<typeof Scene>;
