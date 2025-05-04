// islands/MathAnimation.tsx
import { useEffect, useRef, useState } from "preact/hooks";
import { CanvasEngine } from "../core/canvas/engine.ts";
import { CanvasConfig } from "../schemas/canvas.ts";

interface MathAnimationProps {
  latex: string;
  width?: number;
  height?: number;
}

export function MathAnimation(
  { latex, width = 800, height = 400 }: MathAnimationProps,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">(
    "loading",
  );
  const [error, setError] = useState<string>("");
  const [paths, setPaths] = useState<
    Array<{ d: string; stroke?: string; fill?: string }>
  >([]);

  useEffect(() => {
    if (!canvasRef.current || !latex) return;

    // Set up canvas engine
    const config: CanvasConfig = {
      width,
      height,
      dpi: globalThis.devicePixelRatio,
      backgroundColor: "#ffffff",
    };
    const engine = new CanvasEngine(canvasRef.current, config);

    // Convert LaTeX to SVG with path data
    async function convertLatex() {
      try {
        setStatus("loading");

        const response = await fetch("/api/latex-to-svg", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latex,
            extractPaths: true,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to convert LaTeX");
        }

        const data = await response.json();
        setPaths(data.paths);
        setStatus("ready");

        // Start animation when paths are ready
        if (data.paths && data.paths.length > 0) {
          animatePaths(engine, data.paths);
        }
      } catch (err) {
        console.error("Error in LaTeX conversion:", err);
        setError(err instanceof Error ? err.message : String(err));
        setStatus("error");
      }
    }

    convertLatex();

    // Clean up
    return () => {
      // Any cleanup code here
    };
  }, [latex, width, height]);

  // Function to animate paths on canvas
  function animatePaths(
    engine: CanvasEngine,
    paths: Array<{ d: string; stroke?: string; fill?: string }>,
  ) {
    // Clear canvas
    engine.clear();

    // Get context
    const ctx = engine.getContext();

    // Convert SVG path to canvas path
    function drawSVGPath(d: string, stroke = "#000000", fill = "none") {
      // This is a simplified implementation - a real one would parse SVG path commands
      // Here we just demonstrate the concept
      const path = new Path2D(d);

      ctx.save();
      ctx.strokeStyle = stroke;
      ctx.fillStyle = fill;
      ctx.lineWidth = 2;
      ctx.stroke(path);

      if (fill !== "none") {
        ctx.fill(path);
      }

      ctx.restore();
    }

    // Animation variables
    let pathIndex = 0;
    let progress = 0;
    const animationSpeed = 0.01; // Adjust as needed

    // Animation function
    function animate() {
      engine.clear();

      // Draw completed paths
      for (let i = 0; i < pathIndex; i++) {
        const { d, stroke, fill } = paths[i];
        drawSVGPath(d, stroke, fill);
      }

      // Draw current path with progress
      if (pathIndex < paths.length) {
        const { d, stroke, fill } = paths[pathIndex];

        // This is a simplified version - real implementation would
        // actually draw the path progressively
        if (progress < 1) {
          ctx.globalAlpha = progress;
          drawSVGPath(d, stroke, fill);
          ctx.globalAlpha = 1;
          progress += animationSpeed;
        } else {
          drawSVGPath(d, stroke, fill);
          pathIndex++;
          progress = 0;
        }
      }

      engine.present();

      // Continue animation if not complete
      if (pathIndex < paths.length) {
        requestAnimationFrame(animate);
      }
    }

    // Start animation
    animate();
  }

  return (
    <div class="math-animation">
      {status === "loading" && (
        <div class="text-center py-4">Loading equation...</div>
      )}

      {status === "error" && (
        <div class="text-center py-4 text-red-600">
          Error: {error || "Failed to render equation"}
        </div>
      )}

      <div
        class={`border border-gray-300 rounded-lg overflow-hidden ${
          status !== "ready" ? "hidden" : ""
        }`}
      >
        <canvas ref={canvasRef} width={width} height={height} class="w-full" />
      </div>

      <div class="mt-2 text-sm text-gray-500">
        LaTeX: <code>{latex}</code>
      </div>
    </div>
  );
}
