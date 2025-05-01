import { CanvasConfig, Transform } from "../../schemas/canvas.ts";

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private backBuffer: OffscreenCanvas;
  private backCtx: OffscreenCanvasRenderingContext2D;
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

    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.scale(config.dpi, config.dpi);

    // Set up back buffer for double buffering
    this.backBuffer = new OffscreenCanvas(
      config.width * config.dpi,
      config.height * config.dpi,
    );
    this.backCtx = this.backBuffer.getContext("2d")!;
    this.backCtx.scale(config.dpi, config.dpi);

    // Initialize transform stack
    this.transformStack.push(new DOMMatrix());
  }

  // Save current state
  save(): void {
    this.backCtx.save();
    this.transformStack.push(new DOMMatrix(this.currentTransform.toString()));
  }

  // Restore previous state
  restore(): void {
    this.backCtx.restore();
    if (this.transformStack.length > 1) {
      this.transformStack.pop();
    }
  }

  // Get current transform
  get currentTransform(): DOMMatrix {
    return this.transformStack[this.transformStack.length - 1];
  }

  // Clear the canvas
  clear(): void {
    this.backCtx.fillStyle = this.config.backgroundColor;
    this.backCtx.fillRect(0, 0, this.config.width, this.config.height);
  }

  // Apply transform
  applyTransform(transform: Transform): void {
    this.backCtx.translate(transform.position.x, transform.position.y);
    this.backCtx.rotate(transform.rotation);
    this.backCtx.scale(transform.scale.x, transform.scale.y);
  }

  // Render the back buffer to the main canvas
  present(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.backBuffer, 0, 0);
  }

  // Get rendering context
  getContext(): OffscreenCanvasRenderingContext2D {
    return this.backCtx;
  }

  // Resize the canvas
  resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;

    this.canvas.width = width * this.config.dpi;
    this.canvas.height = height * this.config.dpi;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.backBuffer.width = width * this.config.dpi;
    this.backBuffer.height = height * this.config.dpi;

    this.ctx.scale(this.config.dpi, this.config.dpi);
    this.backCtx.scale(this.config.dpi, this.config.dpi);
  }
}
