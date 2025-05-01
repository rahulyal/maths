import { RenderStyle, Transform } from "../../schemas/canvas.ts";
import { CanvasEngine } from "./engine.ts";

export abstract class Renderer {
  protected engine: CanvasEngine;

  constructor(engine: CanvasEngine) {
    this.engine = engine;
  }

  // Apply rendering style
  protected applyStyle(style: RenderStyle): void {
    const ctx = this.engine.getContext();
    ctx.fillStyle = style.fillStyle;
    ctx.strokeStyle = style.strokeStyle;
    ctx.lineWidth = style.lineWidth;
    ctx.globalAlpha = style.alpha;
  }

  // Apply transform
  protected applyTransform(transform: Transform): void {
    this.engine.save();
    this.engine.applyTransform(transform);
  }

  // Reset transform
  protected resetTransform(): void {
    this.engine.restore();
  }

  // Abstract render method
  abstract render(): void;
}

// Example concrete renderer
export class RectangleRenderer extends Renderer {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private style: RenderStyle;

  constructor(
    engine: CanvasEngine,
    x: number,
    y: number,
    width: number,
    height: number,
    style: RenderStyle,
  ) {
    super(engine);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.style = style;
  }

  render(): void {
    const ctx = this.engine.getContext();
    this.applyStyle(this.style);

    ctx.fillRect(this.x, this.y, this.width, this.height);
    if (this.style.strokeStyle) {
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}
