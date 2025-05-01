import { CanvasEngine } from "../canvas/engine.ts";
import { GridConfig } from "../../schemas/math.ts";
import { Color } from "../../schemas/core.ts";

export class GridRenderer {
  private engine: CanvasEngine;
  private config: GridConfig;

  constructor(engine: CanvasEngine, config: GridConfig) {
    this.engine = engine;
    this.config = config;
  }

  render(): void {
    const ctx = this.engine.getContext();
    const { width, height } = ctx.canvas;

    // Convert pixels to logical units
    const logicalWidth = width / this.config.size;
    const logicalHeight = height / this.config.size;

    // Draw minor grid lines
    ctx.strokeStyle = this.colorToString(this.config.color);
    ctx.lineWidth = this.config.lineWidth;

    for (let x = 0; x <= logicalWidth; x++) {
      const pixelX = x * this.config.size;
      ctx.beginPath();
      ctx.moveTo(pixelX, 0);
      ctx.lineTo(pixelX, height);
      ctx.stroke();
    }

    for (let y = 0; y <= logicalHeight; y++) {
      const pixelY = y * this.config.size;
      ctx.beginPath();
      ctx.moveTo(0, pixelY);
      ctx.lineTo(width, pixelY);
      ctx.stroke();
    }

    // Draw major grid lines
    ctx.strokeStyle = this.colorToString(this.config.majorLines.color);
    ctx.lineWidth = this.config.majorLines.lineWidth;

    for (let x = 0; x <= logicalWidth; x += this.config.majorLines.frequency) {
      const pixelX = x * this.config.size;
      ctx.beginPath();
      ctx.moveTo(pixelX, 0);
      ctx.lineTo(pixelX, height);
      ctx.stroke();
    }

    for (let y = 0; y <= logicalHeight; y += this.config.majorLines.frequency) {
      const pixelY = y * this.config.size;
      ctx.beginPath();
      ctx.moveTo(0, pixelY);
      ctx.lineTo(width, pixelY);
      ctx.stroke();
    }

    // Draw axis
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
  }

  private colorToString(color: Color): string {
    return `rgba(${color.r},${color.g},${color.b},${color.a})`;
  }
}
