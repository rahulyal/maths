// Update your MathCanvas component like this

import { useEffect, useRef } from "preact/hooks";
import { CanvasEngine } from "../core/canvas/engine.ts";
import { GridRenderer } from "../core/math/grid.ts";
import { GraphRenderer } from "../core/math/graph.ts";
import { FunctionGraph, GridConfig, MathEquation } from "../schemas/math.ts";
import { CanvasConfig } from "../schemas/canvas.ts";
import { EquationRenderer } from "../core/math/equation.ts";

export function MathCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const config: CanvasConfig = {
      width: 800,
      height: 600,
      dpi: globalThis.devicePixelRatio,
      backgroundColor: "#ffffff",
    };

    const engine = new CanvasEngine(canvasRef.current, config);

    // Create grid renderer with consistent scale
    const gridConfig: GridConfig = {
      size: 20, // 20 pixels per unit
      lineWidth: 0.5,
      color: { r: 200, g: 200, b: 200, a: 1 },
      majorLines: {
        frequency: 5,
        lineWidth: 1,
        color: { r: 150, g: 150, b: 150, a: 1 },
      },
    };
    const gridRenderer = new GridRenderer(engine, gridConfig);

    // Create equation renderer
    const equation: MathEquation = {
      latex: "f(x) = sin(x)",
      position: { x: 100, y: 50 },
      fontSize: 32,
      color: { r: 0, g: 0, b: 0, a: 1 },
      animationDuration: 2000,
    };
    const equationRenderer = new EquationRenderer(engine, equation);
    // Collection of graph renderers
    const graphRenderers: GraphRenderer[] = [];

    // Create graph renderers with appropriate domains that fit the grid
    // For an 800x600 canvas with 20px per unit, we have 40x30 units
    const sinGraph: FunctionGraph = {
      expression: "sin(x)",
      domain: { min: -20, max: 20 }, // Fits the grid width
      range: { min: -15, max: 15 }, // Fits the grid height
      color: { r: 255, g: 0, b: 0, a: 1 },
      lineWidth: 2,
      style: "solid",
    };
    graphRenderers.push(new GraphRenderer(engine, sinGraph));

    const quadraticGraph: FunctionGraph = {
      expression: "x*x/10",
      domain: { min: -20, max: 20 },
      range: { min: -15, max: 15 },
      color: { r: 0, g: 0, b: 255, a: 1 },
      lineWidth: 2,
      style: "solid",
    };
    graphRenderers.push(new GraphRenderer(engine, quadraticGraph));

    // Animation loop
    let lastTime = 0;
    function animate(time: number) {
      const deltaTime = time - lastTime;
      lastTime = time;

      engine.clear();

      // Render grid first
      gridRenderer.render();

      // Then render the equation
      equationRenderer.update(deltaTime);
      equationRenderer.render();

      // Then render all graphs
      graphRenderers.forEach((renderer) => {
        renderer.update(deltaTime);
        renderer.render();
      });

      engine.present();

      requestAnimationFrame(animate);
    }

    animate(0);

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.parentElement?.getBoundingClientRect();
      if (rect) {
        engine.resize(rect.width, rect.height);
      }
    };

    globalThis.addEventListener("resize", handleResize);

    return () => {
      globalThis.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div class="p-4">
      <h2 class="text-xl font-bold mb-4">Math Rendering System</h2>
      <div class="border border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <canvas
          ref={canvasRef}
          class="w-full h-[600px] bg-white"
        />
      </div>
      <div class="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 class="font-semibold mb-2">Functions Displayed:</h3>
        <ul class="list-disc list-inside ml-4 space-y-1">
          <li>
            <span class="text-red-600 font-mono">f(x) = sin(x)</span>{" "}
            - Sine wave function (red)
          </li>
          <li>
            <span class="text-blue-600 font-mono">f(x) = x²/10</span>{" "}
            - Quadratic function (blue)
          </li>
        </ul>
      </div>
    </div>
  );
}
