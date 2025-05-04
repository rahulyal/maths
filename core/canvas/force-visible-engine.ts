// core/canvas/force-visible-engine.ts
import { CanvasConfig } from "../../schemas/canvas.ts";

// This is a simplified version of the canvas engine that focuses only on visibility
export class ForceVisibleEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;

  constructor(canvas: HTMLCanvasElement, config: CanvasConfig) {
    this.canvas = canvas;

    // Set dimensions without using a back buffer
    this.canvas.width = config.width;
    this.canvas.height = config.height;
    this.canvas.style.width = `${config.width}px`;
    this.canvas.style.height = `${config.height}px`;

    // Get context directly
    this.ctx = this.canvas.getContext("2d");

    // Draw initial pattern to confirm visibility
    this.drawTestPattern();

    console.log("ForceVisibleEngine created:", {
      width: config.width,
      height: config.height,
      ctxOk: !!this.ctx,
    });
  }

  // Draw a test pattern to verify canvas is working
  drawTestPattern(): void {
    if (!this.ctx) return;

    const { width, height } = this.canvas;

    // Clear canvas with light background
    this.ctx.fillStyle = "#f0f0f0";
    this.ctx.fillRect(0, 0, width, height);

    // Draw red border
    this.ctx.strokeStyle = "#ff0000";
    this.ctx.lineWidth = 5;
    this.ctx.strokeRect(0, 0, width, height);

    // Draw blue rectangle
    this.ctx.fillStyle = "#3498db";
    this.ctx.fillRect(width / 4, height / 4, width / 2, height / 2);

    // Draw text
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 24px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("Math Animation Demo", width / 2, height / 2);

    // Draw grid
    this.ctx.strokeStyle = "#aaaaaa";
    this.ctx.lineWidth = 1;

    for (let x = 0; x < width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    for (let y = 0; y < height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    console.log("Test pattern drawn successfully");
  }

  // Draw a specific equation with fixed visibility
  drawEquation(latex: string): void {
    if (!this.ctx) return;

    const { width, height } = this.canvas;

    // Draw equation background
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);

    // Draw border
    this.ctx.strokeStyle = "#2980b9";
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);

    // Draw equation text
    this.ctx.fillStyle = "#000000";
    this.ctx.font = "bold 32px serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(latex, width / 2, height / 2);

    // Add decorative elements based on equation type
    if (latex.includes("=")) {
      // Draw equals sign emphasis
      const eqPos = latex.indexOf("=");
      const textWidth = this.ctx.measureText(latex).width;
      const charWidth = textWidth / latex.length;
      const xPos = width / 2 - textWidth / 2 + eqPos * charWidth;

      this.ctx.strokeStyle = "#e74c3c";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(xPos, height / 2, 20, 0, Math.PI * 2);
      this.ctx.stroke();
    } else if (latex.includes("^")) {
      // Draw power emphasis
      this.ctx.strokeStyle = "#27ae60";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(width * 0.3, height * 0.4);
      this.ctx.bezierCurveTo(
        width * 0.4,
        height * 0.3,
        width * 0.6,
        height * 0.3,
        width * 0.7,
        height * 0.4,
      );
      this.ctx.stroke();
    } else if (latex.includes("\\frac")) {
      // Draw fraction line
      this.ctx.strokeStyle = "#8e44ad";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(width * 0.3, height / 2);
      this.ctx.lineTo(width * 0.7, height / 2);
      this.ctx.stroke();
    }

    console.log(`Equation "${latex}" drawn directly`);
  }

  // Draw animation frame at a specific progress
  drawAnimationFrame(latex: string, progress: number): void {
    if (!this.ctx) return;

    const { width, height } = this.canvas;

    // Clear with background
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, width, height);

    // Draw progress indicator
    const barWidth = width * 0.8;
    const barHeight = 10;
    const barX = width * 0.1;
    const barY = height * 0.9;

    // Background bar
    this.ctx.fillStyle = "#ecf0f1";
    this.ctx.fillRect(barX, barY, barWidth, barHeight);

    // Progress bar
    this.ctx.fillStyle = "#3498db";
    this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);

    // Draw equation text with size based on progress
    const baseSize = 12;
    const maxSize = 32;
    const fontSize = baseSize + (maxSize - baseSize) * progress;

    this.ctx.fillStyle = "#000000";
    this.ctx.font = `bold ${fontSize}px serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(latex, width / 2, height / 2);

    // Draw decorative elements that animate with progress
    const radius = 30 * progress;
    this.ctx.strokeStyle = "#e74c3c";
    this.ctx.lineWidth = 2 * progress;

    // Draw animated elements
    this.ctx.beginPath();
    this.ctx.arc(width * 0.25, height * 0.3, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(width * 0.75, height * 0.3, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    // Draw animated path
    this.ctx.beginPath();
    this.ctx.moveTo(width * 0.2, height * 0.7);
    this.ctx.bezierCurveTo(
      width * 0.4,
      height * (0.7 - 0.3 * progress),
      width * 0.6,
      height * (0.7 - 0.3 * progress),
      width * 0.8,
      height * 0.7,
    );
    this.ctx.strokeStyle = "#27ae60";
    this.ctx.lineWidth = 3 * progress;
    this.ctx.stroke();

    console.log(`Animation frame drawn at progress: ${progress}`);
  }
}
