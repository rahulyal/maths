import { CanvasEngine } from "../canvas/engine.ts";
import { FunctionGraph } from "../../schemas/math.ts";
import { Vector2D } from "../../schemas/canvas.ts";
import { Color } from "../../schemas/core.ts";

export class GraphRenderer {
  private engine: CanvasEngine;
  private graph: FunctionGraph;
  private points: Vector2D[] = [];
  private animationProgress: number = 0;
  private startTime: number = 0;
  private axisRenderer: AxisRenderer;
  private padding = 60; // Increased padding for labels

  constructor(engine: CanvasEngine, graph: FunctionGraph) {
    this.engine = engine;
    this.graph = graph;
    this.axisRenderer = new AxisRenderer(
      engine,
      graph.domain,
      graph.range,
      this.padding,
    );
    this.calculatePoints();
  }

  private calculatePoints(): void {
    const resolution = 400;
    const stepSize = (this.graph.domain.max - this.graph.domain.min) /
      resolution;
    this.points = [];

    for (let i = 0; i <= resolution; i++) {
      const x = this.graph.domain.min + i * stepSize;
      const y = this.evaluateFunction(x);

      if (!isNaN(y) && isFinite(y)) {
        this.points.push(this.mathToCanvas(x, y));
      }
    }
  }

  private evaluateFunction(x: number): number {
    try {
      // Handle common mathematical functions
      const expression = this.graph.expression
        .replace(/sin\(([^)]+)\)/g, "Math.sin($1)")
        .replace(/cos\(([^)]+)\)/g, "Math.cos($1)")
        .replace(/tan\(([^)]+)\)/g, "Math.tan($1)")
        .replace(/sqrt\(([^)]+)\)/g, "Math.sqrt($1)")
        .replace(/log\(([^)]+)\)/g, "Math.log($1)")
        .replace(/exp\(([^)]+)\)/g, "Math.exp($1)")
        .replace(/\^/g, "**")
        .replace(/abs\(([^)]+)\)/g, "Math.abs($1)")
        .replace(/x/g, String(x));

      return eval(expression);
    } catch (e) {
      console.error(`Error evaluating function at x=${x}:`, e);
      return NaN;
    }
  }

  private mathToCanvas(x: number, y: number): Vector2D {
    const ctx = this.engine.getContext();
    const canvas = ctx.canvas;

    // Use the actual canvas dimensions instead of DOM dimensions
    const width = canvas.width / this.engine["config"].dpi;
    const height = canvas.height / this.engine["config"].dpi;

    // Define graph bounds with padding
    const graphWidth = width - 2 * this.padding;
    const graphHeight = height - 2 * this.padding;

    // Calculate the center of the graph area
    const centerX = this.padding + graphWidth / 2;
    const centerY = this.padding + graphHeight / 2;

    // Calculate scale factors
    const scaleX = graphWidth / (this.graph.domain.max - this.graph.domain.min);
    const scaleY = graphHeight / (this.graph.range.max - this.graph.range.min);

    // Transform to canvas coordinates
    let canvasX, canvasY;

    if (this.graph.domain.min <= 0 && this.graph.domain.max >= 0) {
      // Y-axis is visible in the graph
      const yAxisX = this.padding + (-this.graph.domain.min) * scaleX;
      canvasX = yAxisX + x * scaleX;
    } else {
      // Y-axis is outside the graph
      canvasX = this.padding + (x - this.graph.domain.min) * scaleX;
    }

    if (this.graph.range.min <= 0 && this.graph.range.max >= 0) {
      // X-axis is visible in the graph
      const xAxisY = height - this.padding - (-this.graph.range.min) * scaleY;
      canvasY = xAxisY - y * scaleY;
    } else {
      // X-axis is outside the graph
      canvasY = height - this.padding - (y - this.graph.range.min) * scaleY;
    }

    return { x: canvasX, y: canvasY };
  }

  update(deltaTime: number): void {
    if (this.startTime === 0) {
      this.startTime = Date.now();
    }

    const elapsed = Date.now() - this.startTime;
    this.animationProgress = Math.min(elapsed / 2000, 1);
  }

  render(): void {
    this.axisRenderer.render();
    this.renderGraph();
    this.renderLabel();
  }

  private renderGraph(): void {
    const ctx = this.engine.getContext();
    const pointsToDraw = Math.floor(
      this.points.length * this.animationProgress,
    );

    if (pointsToDraw < 2) return;

    ctx.strokeStyle = this.colorToString(this.graph.color);
    ctx.lineWidth = this.graph.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (this.graph.style === "handwritten") {
      this.renderHandwrittenStyle(pointsToDraw);
    } else {
      this.renderNormalStyle(pointsToDraw);
    }
  }

  private renderHandwrittenStyle(pointsToDraw: number): void {
    const ctx = this.engine.getContext();

    ctx.strokeStyle = this.colorToString(this.graph.color);
    ctx.lineWidth = this.graph.lineWidth;

    for (let i = 0; i < pointsToDraw - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];

      // Add slight randomness for handwritten effect
      const jitter = 0.5;
      const dx = (Math.random() - 0.5) * jitter;
      const dy = (Math.random() - 0.5) * jitter;

      ctx.beginPath();
      ctx.moveTo(p1.x + dx, p1.y + dy);
      ctx.lineTo(p2.x + dx, p2.y + dy);
      ctx.stroke();
    }
  }

  private renderNormalStyle(pointsToDraw: number): void {
    const ctx = this.engine.getContext();

    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);

    for (let i = 1; i < pointsToDraw; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }

    ctx.stroke();
  }

  private renderLabel(): void {
    const ctx = this.engine.getContext();

    if (this.points.length === 0) return;

    // Find a good point for the label
    const midIndex = Math.floor(this.points.length / 2);
    const labelPoint = this.points[midIndex];

    if (!labelPoint) return;

    ctx.fillStyle = this.colorToString(this.graph.color);
    ctx.font = "16px Arial";
    ctx.textBaseline = "bottom";

    // Adjust label position based on graph
    const offset = 10;
    ctx.textAlign = "left";
    ctx.fillText(
      this.graph.expression,
      labelPoint.x + offset,
      labelPoint.y - offset,
    );
  }

  private colorToString(color: Color): string {
    return `rgba(${color.r},${color.g},${color.b},${color.a})`;
  }
}

class AxisRenderer {
  private engine: CanvasEngine;
  private domain: { min: number; max: number };
  private range: { min: number; max: number };
  private padding: number;

  constructor(
    engine: CanvasEngine,
    domain: { min: number; max: number },
    range: { min: number; max: number },
    padding: number,
  ) {
    this.engine = engine;
    this.domain = domain;
    this.range = range;
    this.padding = padding;
  }

  render(): void {
    const ctx = this.engine.getContext();
    const canvas = ctx.canvas;

    // Use actual canvas dimensions instead of DOM dimensions
    const width = canvas.width / this.engine["config"].dpi;
    const height = canvas.height / this.engine["config"].dpi;

    ctx.save();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.font = "12px Arial";
    ctx.fillStyle = "#333";

    // Calculate graph bounds
    const graphWidth = width - 2 * this.padding;
    const graphHeight = height - 2 * this.padding;

    // Calculate scale factors
    const scaleX = graphWidth / (this.domain.max - this.domain.min);
    const scaleY = graphHeight / (this.range.max - this.range.min);

    // Find axis positions
    let xAxisY, yAxisX;

    if (this.range.min <= 0 && this.range.max >= 0) {
      // X-axis is within the graph
      xAxisY = height - this.padding - (-this.range.min) * scaleY;
    } else {
      // X-axis is outside
      xAxisY = height - this.padding;
    }

    if (this.domain.min <= 0 && this.domain.max >= 0) {
      // Y-axis is within the graph
      yAxisX = this.padding + (-this.domain.min) * scaleX;
    } else {
      // Y-axis is outside
      yAxisX = this.padding;
    }

    // Draw X axis
    ctx.beginPath();
    ctx.moveTo(this.padding, xAxisY);
    ctx.lineTo(width - this.padding, xAxisY);
    ctx.stroke();

    // Draw Y axis
    ctx.beginPath();
    ctx.moveTo(yAxisX, this.padding);
    ctx.lineTo(yAxisX, height - this.padding);
    ctx.stroke();

    // Draw grid lines and labels
    this.drawGrid(ctx, width, height, xAxisY, yAxisX);
    this.drawLabels(ctx, width, height, xAxisY, yAxisX);

    ctx.restore();
  }

  private drawGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    xAxisY: number,
    yAxisX: number,
  ): void {
    ctx.save();
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 0.5;

    // Calculate number of grid lines
    const xSteps = Math.min(10, Math.ceil(width / 50));
    const ySteps = Math.min(10, Math.ceil(height / 50));

    // X grid lines
    const xStep = (width - 2 * this.padding) / xSteps;
    for (let i = 0; i <= xSteps; i++) {
      const x = this.padding + i * xStep;
      ctx.beginPath();
      ctx.moveTo(x, this.padding);
      ctx.lineTo(x, height - this.padding);
      ctx.stroke();
    }

    // Y grid lines
    const yStep = (height - 2 * this.padding) / ySteps;
    for (let i = 0; i <= ySteps; i++) {
      const y = this.padding + i * yStep;
      ctx.beginPath();
      ctx.moveTo(this.padding, y);
      ctx.lineTo(width - this.padding, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawLabels(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    xAxisY: number,
    yAxisX: number,
  ): void {
    ctx.save();
    ctx.fillStyle = "#333";

    // Calculate number of labels
    const xSteps = Math.min(10, Math.ceil(width / 80));
    const ySteps = Math.min(10, Math.ceil(height / 50));

    // X axis labels
    const xStep = (width - 2 * this.padding) / xSteps;
    const domainStep = (this.domain.max - this.domain.min) / xSteps;

    for (let i = 0; i <= xSteps; i++) {
      const x = this.padding + i * xStep;
      const value = this.domain.min + i * domainStep;
      const label = value.toFixed(1);

      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(label, x, xAxisY + 5);
    }

    // Y axis labels
    const yStep = (height - 2 * this.padding) / ySteps;
    const rangeStep = (this.range.max - this.range.min) / ySteps;

    for (let i = 0; i <= ySteps; i++) {
      const y = height - this.padding - i * yStep;
      const value = this.range.min + i * rangeStep;
      const label = value.toFixed(1);

      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(label, yAxisX - 5, y);
    }

    // Draw axis arrows
    this.drawArrows(ctx, width, height, xAxisY, yAxisX);

    ctx.restore();
  }

  private drawArrows(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    xAxisY: number,
    yAxisX: number,
  ): void {
    const arrowSize = 8;

    // X axis arrow
    ctx.beginPath();
    ctx.moveTo(width - this.padding, xAxisY);
    ctx.lineTo(width - this.padding - arrowSize, xAxisY - arrowSize / 2);
    ctx.lineTo(width - this.padding - arrowSize, xAxisY + arrowSize / 2);
    ctx.closePath();
    ctx.fill();

    // Y axis arrow
    ctx.beginPath();
    ctx.moveTo(yAxisX, this.padding);
    ctx.lineTo(yAxisX - arrowSize / 2, this.padding + arrowSize);
    ctx.lineTo(yAxisX + arrowSize / 2, this.padding + arrowSize);
    ctx.closePath();
    ctx.fill();
  }
}
