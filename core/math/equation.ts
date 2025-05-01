import { CanvasEngine } from "../canvas/engine.ts";
import { MathEquation } from "../../schemas/math.ts";
import { Vector2D } from "../../schemas/canvas.ts";
import { Color } from "../../schemas/core.ts";

export class EquationRenderer {
  private engine: CanvasEngine;
  private equation: MathEquation;
  private pathPoints: Vector2D[][] = [];
  private animationProgress: number = 0;
  private startTime: number = 0;

  constructor(engine: CanvasEngine, equation: MathEquation) {
    this.engine = engine;
    this.equation = equation;
    this.generatePaths();
  }

  private generatePaths(): void {
    // This is a simplified LaTeX parser for basic equations
    // In a real implementation, you'd use a proper LaTeX parser like KaTeX
    const symbols = this.equation.latex.split(/([+-×÷=(){}[\]])/);
    let currentX = this.equation.position.x;
    const baseY = this.equation.position.y;

    for (const symbol of symbols) {
      if (symbol.trim() === "") continue;

      const path = this.getSymbolPath(symbol, currentX, baseY);
      if (path.length > 0) {
        this.pathPoints.push(path);
        // Approximate width based on symbol type
        currentX += this.getSymbolWidth(symbol);
      }
    }
  }

  private getSymbolPath(symbol: string, x: number, y: number): Vector2D[] {
    // Simplified character paths - would use proper font data in production
    const paths: { [key: string]: Vector2D[] } = {
      "+": [
        { x: x + 10, y: y },
        { x: x + 10, y: y + 20 },
        { x: x, y: y + 10 },
        { x: x + 20, y: y + 10 },
      ],
      "-": [
        { x: x, y: y + 10 },
        { x: x + 20, y: y + 10 },
      ],
      "×": [
        { x: x, y: y },
        { x: x + 20, y: y + 20 },
        { x: x + 20, y: y },
        { x: x, y: y + 20 },
      ],
      "=": [
        { x: x, y: y + 7 },
        { x: x + 20, y: y + 7 },
        { x: x, y: y + 13 },
        { x: x + 20, y: y + 13 },
      ],
      // Numbers and letters would be more complex
      ...this.getAlphanumericPaths(symbol, x, y),
    };

    return paths[symbol] || this.getDefaultPath(symbol, x, y);
  }

  private getAlphanumericPaths(
    symbol: string,
    x: number,
    y: number,
  ): { [key: string]: Vector2D[] } {
    // Simplified paths for demonstration
    if (/[a-zA-Z0-9]/.test(symbol)) {
      return {
        [symbol]: [
          { x: x, y: y },
          { x: x + 15, y: y },
          { x: x + 15, y: y + 20 },
          { x: x, y: y + 20 },
          { x: x, y: y },
        ],
      };
    }
    return {};
  }

  private getDefaultPath(symbol: string, x: number, y: number): Vector2D[] {
    // Fallback path for unrecognized symbols
    return [
      { x: x, y: y },
      { x: x + 10, y: y },
      { x: x + 10, y: y + 20 },
      { x: x, y: y + 20 },
      { x: x, y: y },
    ];
  }

  private getSymbolWidth(symbol: string): number {
    // Simplified width calculation
    if (symbol.length > 1) return symbol.length * 10;
    return /[a-zA-Z0-9]/.test(symbol) ? 20 : 25;
  }

  update(deltaTime: number): void {
    if (this.startTime === 0) {
      this.startTime = Date.now();
    }

    const elapsed = Date.now() - this.startTime;
    this.animationProgress = Math.min(
      elapsed / this.equation.animationDuration,
      1,
    );
  }

  render(): void {
    const ctx = this.engine.getContext();
    ctx.strokeStyle = this.colorToString(this.equation.color);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let i = 0; i < this.pathPoints.length; i++) {
      const path = this.pathPoints[i];
      const pathProgress = Math.max(
        0,
        this.animationProgress * this.pathPoints.length - i,
      );

      if (pathProgress > 0) {
        this.renderPath(path, Math.min(pathProgress, 1));
      }
    }
  }

  private renderPath(path: Vector2D[], progress: number): void {
    const ctx = this.engine.getContext();
    const totalPoints = path.length;
    const pointsToDraw = Math.floor(totalPoints * progress);

    if (pointsToDraw < 2) return;

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < pointsToDraw; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }

    // Partial line for smooth animation
    if (progress < 1 && pointsToDraw < totalPoints) {
      const lastPoint = path[pointsToDraw - 1];
      const nextPoint = path[pointsToDraw];
      const partial = (totalPoints * progress) - pointsToDraw;

      ctx.lineTo(
        lastPoint.x + (nextPoint.x - lastPoint.x) * partial,
        lastPoint.y + (nextPoint.y - lastPoint.y) * partial,
      );
    }

    ctx.stroke();
  }

  private colorToString(color: Color): string {
    return `rgba(${color.r},${color.g},${color.b},${color.a})`;
  }
}
