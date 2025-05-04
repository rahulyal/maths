// core/math/svg-renderer.ts
import { CanvasEngine } from "../canvas/engine.ts";
import { SVGElement } from "../../utils/anime.ts";

/**
 * Renders SVG elements on a canvas with proper transforms and hierarchy
 */
export class SVGRenderer {
  private engine: CanvasEngine;
  private viewBox: number[];
  private width: number;
  private height: number;

  constructor(
    engine: CanvasEngine,
    viewBox: number[],
    width: number,
    height: number,
  ) {
    this.engine = engine;
    this.viewBox = viewBox;
    this.width = width;
    this.height = height;
    console.log(
      "SVG Renderer created with viewBox:",
      viewBox,
      "dimensions:",
      width,
      "x",
      height,
    );
  }

  /**
   * Renders a hierarchy of SVG elements
   */
  render(elements: SVGElement[], progress: number = 1) {
    try {
      console.log(
        `Rendering ${elements.length} root elements at progress: ${progress}`,
      );

      // Get rendering context
      const ctx = this.engine.getContext();
      if (!ctx) {
        console.error("No canvas context available for rendering");
        return;
      }

      // DEBUG: Draw a border to show the canvas area is working
      ctx.save();
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 5;
      ctx.strokeRect(0, 0, this.width, this.height);
      ctx.fillStyle = "rgba(200, 200, 200, 0.2)";
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();

      // Add debug text
      ctx.save();
      ctx.fillStyle = "#000000";
      ctx.font = "20px sans-serif";
      ctx.fillText(
        `Math Equation: Progress ${(progress * 100).toFixed(0)}%`,
        50,
        30,
      );
      ctx.restore();

      // Apply viewBox transform
      ctx.save();
      this.applyViewBoxTransform(ctx);

      // Use simplified rendering for debugging
      this.renderSimplifiedElements(elements, ctx, progress);

      ctx.restore();

      // Draw colored border to show animation progress
      ctx.save();
      const hue = (progress * 360) % 360;
      ctx.strokeStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, this.width - 20, this.height - 20);
      ctx.restore();
    } catch (err) {
      console.error("SVG rendering error:", err);
    }
  }

  /**
   * Apply the SVG viewBox transformation to fit the canvas
   */
  private applyViewBoxTransform(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  ) {
    try {
      // Get canvas dimensions
      const canvasWidth = this.width;
      const canvasHeight = this.height;

      // ViewBox parameters
      const [minX, minY, vbWidth, vbHeight] = this.viewBox;

      // Calculate scale to fit while preserving aspect ratio
      const scaleX = canvasWidth / vbWidth;
      const scaleY = canvasHeight / vbHeight;
      const scale = Math.min(scaleX, scaleY) * 0.8; // Add more padding for visibility

      // Calculate centering offset
      const offsetX = (canvasWidth - vbWidth * scale) / 2;
      const offsetY = (canvasHeight - vbHeight * scale) / 2;

      // Apply transform
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      ctx.translate(-minX, -minY);

      console.log("Applied viewBox transform:", {
        canvasWidth,
        canvasHeight,
        viewBox: this.viewBox,
        scale,
        offsetX,
        offsetY,
      });
    } catch (err) {
      console.error("Error applying viewBox transform:", err);
    }
  }

  /**
   * Render a simplified version of all elements for better visibility
   */
  private renderSimplifiedElements(
    elements: SVGElement[],
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    progress: number,
  ) {
    try {
      // Draw a grid to help with visibility
      this.drawGrid(ctx);

      // Simple visualization for debugging - just make sure something is visible
      let y = 80;
      const colors = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6"];

      // Process each element
      elements.forEach((element, index) => {
        const colorIndex = index % colors.length;
        const color = colors[colorIndex];

        // Draw a large colored rectangle for each top-level element
        ctx.save();

        // Full opacity for visibility
        ctx.globalAlpha = 1;

        // Start with a background rectangle
        const width = 150 * progress;
        const height = 40;
        ctx.fillStyle = `${color}33`; // 20% opacity
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.fillRect(40, y, width, height);
        ctx.strokeRect(40, y, width, height);

        // Add text label
        ctx.fillStyle = "#000000";
        ctx.font = "16px sans-serif";
        ctx.fillText(`${element.type} (${element.id || "no-id"})`, 50, y + 25);

        // Add children if any
        if (element.children && element.children.length > 0) {
          ctx.fillStyle = "#666666";
          ctx.font = "12px sans-serif";
          ctx.fillText(`${element.children.length} children`, 50, y + 45);

          // Draw children with indent
          element.children.forEach((child, childIndex) => {
            const childY = y + 50 + childIndex * 25;
            const childColor =
              colors[(colorIndex + childIndex + 1) % colors.length];

            ctx.fillStyle = `${childColor}33`;
            ctx.strokeStyle = childColor;
            ctx.fillRect(60, childY, 100 * progress, 20);
            ctx.strokeRect(60, childY, 100 * progress, 20);

            ctx.fillStyle = "#000000";
            ctx.font = "12px sans-serif";
            ctx.fillText(`${child.type}`, 70, childY + 15);
          });

          // Adjust y for next element
          y += 50 + element.children.length * 25 + 10;
        } else {
          y += 60;
        }

        ctx.restore();
      });

      console.log(`Rendered ${elements.length} top-level elements`);
    } catch (err) {
      console.error("Error rendering simplified elements:", err);
    }
  }

  /**
   * Draw a grid for better visibility
   */
  private drawGrid(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  ) {
    ctx.save();

    // Draw a grid
    const gridSize = 50;
    const width = this.width * 2;
    const height = this.height * 2;

    // Draw light grid
    ctx.strokeStyle = "#dddddd";
    ctx.lineWidth = 0.5;

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "#999999";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    ctx.restore();
  }
}
