import { useEffect, useRef } from "preact/hooks";
import { CanvasEngine } from "../core/canvas/engine.ts";
import { RectangleRenderer } from "../core/canvas/renderer.ts";
import { CanvasConfig, RenderStyle } from "../schemas/canvas.ts";

export function CanvasTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const config: CanvasConfig = {
      width: 800,
      height: 600,
      dpi: globalThis.devicePixelRatio,
      backgroundColor: "#f0f0f0",
    };

    const engine = new CanvasEngine(canvasRef.current, config);

    // Create some objects to render
    const renderers = [
      new RectangleRenderer(
        engine,
        100,
        100,
        50,
        50,
        {
          fillStyle: "#3498db",
          strokeStyle: "#2980b9",
          lineWidth: 2,
          alpha: 1,
        },
      ),
      new RectangleRenderer(
        engine,
        200,
        200,
        100,
        100,
        {
          fillStyle: "#e74c3c",
          strokeStyle: "#c0392b",
          lineWidth: 3,
          alpha: 1,
        },
      ),
    ];

    // Animation loop
    function animate() {
      engine.clear();

      // Render all objects
      renderers.forEach((renderer) => renderer.render());

      // Present the final frame
      engine.present();

      requestAnimationFrame(animate);
    }

    animate();

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
      <h2 class="text-xl font-bold mb-4">Canvas Engine Test</h2>
      <div class="border border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          class="w-full h-[600px]"
        />
      </div>
    </div>
  );
}
