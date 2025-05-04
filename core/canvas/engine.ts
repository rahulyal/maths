// core/canvas/engine.ts
import { CanvasConfig, Transform } from "../../schemas/canvas.ts";

// Define a type that can represent either 2D context type
type Context2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: Context2D | null;
  private backBuffer: HTMLCanvasElement; // Just use regular canvas for consistency
  private backCtx: Context2D | null;
  private config: CanvasConfig;
  private transformStack: DOMMatrix[] = [];

  constructor(canvas: HTMLCanvasElement, config: CanvasConfig) {
    this.canvas = canvas;
    this.config = config;

    // Set up main canvas
    this.canvas.width = config.width * config.dpi;
    this.canvas.height = config.height * config.dpi;
    this.canvas.style.width = `${config.width}px`;
    this.canvas.style.height = `${config.height}px`;

    this.ctx = this.canvas.getContext("2d");
    if (this.ctx) {
      this.ctx.scale(config.dpi, config.dpi);
    }

    // Use a regular canvas for the back buffer - more reliable
    this.backBuffer = document.createElement("canvas");
    this.backBuffer.width = config.width * config.dpi;
    this.backBuffer.height = config.height * config.dpi;
    this.backCtx = this.backBuffer.getContext("2d");
    if (this.backCtx) {
      this.backCtx.scale(config.dpi, config.dpi);
    }

    // Initialize transform stack
    this.transformStack.push(new DOMMatrix());

    // Log canvas setup for debugging
    console.log("Canvas engine initialized:", {
      width: config.width,
      height: config.height,
      dpi: config.dpi,
      ctxOk: !!this.ctx,
      backCtxOk: !!this.backCtx,
    });
  }

  // Save current state
  save(): void {
    if (this.backCtx) {
      this.backCtx.save();
      this.transformStack.push(new DOMMatrix(this.currentTransform.toString()));
    }
  }

  // Restore previous state
  restore(): void {
    if (this.backCtx) {
      this.backCtx.restore();
      if (this.transformStack.length > 1) {
        this.transformStack.pop();
      }
    }
  }

  // Get current transform
  get currentTransform(): DOMMatrix {
    return this.transformStack[this.transformStack.length - 1];
  }

  // Clear the canvas
  clear(): void {
    if (this.backCtx) {
      this.backCtx.fillStyle = this.config.backgroundColor;
      this.backCtx.fillRect(0, 0, this.config.width, this.config.height);
    }
  }

  // Apply transform
  applyTransform(transform: Transform): void {
    if (this.backCtx) {
      this.backCtx.translate(transform.position.x, transform.position.y);
      this.backCtx.rotate(transform.rotation);
      this.backCtx.scale(transform.scale.x, transform.scale.y);
    }
  }

  // Render the back buffer to the main canvas
  present(): void {
    if (this.ctx && this.backBuffer) {
      try {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.backBuffer, 0, 0);
      } catch (e) {
        console.error("Error presenting canvas:", e);
      }
    }
  }

  // Get rendering context - use union type to match both possible context types
  getContext(): Context2D | null {
    if (!this.backCtx) {
      console.error("Failed to get back buffer context");
    }
    return this.backCtx;
  }

  // Resize the canvas
  resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;

    // Resize main canvas
    this.canvas.width = width * this.config.dpi;
    this.canvas.height = height * this.config.dpi;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Resize back buffer
    this.backBuffer.width = width * this.config.dpi;
    this.backBuffer.height = height * this.config.dpi;

    // Reset context scales
    if (this.ctx) {
      this.ctx.scale(this.config.dpi, this.config.dpi);
    }
    if (this.backCtx) {
      this.backCtx.scale(this.config.dpi, this.config.dpi);
    }
  }

  // Draw a test rectangle - helpful for debugging
  drawTestPattern(): void {
    if (this.backCtx) {
      this.backCtx.fillStyle = "#ff0000";
      this.backCtx.fillRect(10, 10, 50, 50);

      this.backCtx.strokeStyle = "#0000ff";
      this.backCtx.lineWidth = 2;
      this.backCtx.beginPath();
      this.backCtx.moveTo(70, 10);
      this.backCtx.lineTo(120, 60);
      this.backCtx.stroke();

      this.backCtx.fillStyle = "#000000";
      this.backCtx.font = "16px sans-serif";
      this.backCtx.fillText("Test Pattern", 80, 30);

      this.present();
    }
  }
}
