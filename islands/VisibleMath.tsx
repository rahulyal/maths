// islands/VisibleMath.tsx
import { useEffect, useRef, useState } from "preact/hooks";
import { ForceVisibleEngine } from "../core/canvas/force-visible-engine.ts";
import { CanvasConfig } from "../schemas/canvas.ts";

interface VisibleMathProps {
  latex: string;
  width?: number;
  height?: number;
  animate?: boolean;
}

export default function VisibleMath({
  latex,
  width = 800,
  height = 400,
  animate = true,
}: VisibleMathProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<ForceVisibleEngine | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize engine on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create the simplified engine
    const config: CanvasConfig = {
      width,
      height,
      dpi: 1, // Use simple scaling
      backgroundColor: "#ffffff",
    };

    const newEngine = new ForceVisibleEngine(canvasRef.current, config);
    setEngine(newEngine);

    // If not animating, draw the equation immediately
    if (!animate) {
      newEngine.drawEquation(latex);
    }

    return () => {
      // Clean up animation on unmount
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [canvasRef, latex, width, height, animate]);

  // Start animation when engine is ready
  useEffect(() => {
    if (!engine || !animate) return;

    let startTime = 0;
    const animationDuration = 2000; // 2 seconds

    const animateFrame = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      setAnimationProgress(progress);
      engine.drawAnimationFrame(latex, progress);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateFrame);
      } else {
        setIsAnimating(false);
      }
    };

    // Start animation
    setIsAnimating(true);
    setAnimationProgress(0);
    animationFrameRef.current = requestAnimationFrame(animateFrame);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [engine, animate, latex]);

  // Handle play button click
  const handlePlay = () => {
    if (!engine) return;

    if (isAnimating) {
      // Pause animation
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setIsAnimating(false);
    } else {
      // Resume or restart animation
      let startTime = 0;
      const animationDuration = 2000; // 2 seconds
      const startProgress = animationProgress;

      const animateFrame = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        // Calculate progress from current position
        const additionalProgress = elapsed / animationDuration;
        const progress = Math.min(startProgress + additionalProgress, 1);

        setAnimationProgress(progress);
        engine.drawAnimationFrame(latex, progress);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateFrame);
        } else {
          setIsAnimating(false);
        }
      };

      setIsAnimating(true);
      animationFrameRef.current = requestAnimationFrame(animateFrame);
    }
  };

  // Handle reset button click
  const handleReset = () => {
    if (!engine) return;

    // Stop any running animation
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Reset progress
    setAnimationProgress(0);
    setIsAnimating(false);

    // Redraw first frame
    engine.drawAnimationFrame(latex, 0);
  };

  return (
    <div className="math-animation">
      <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full"
        >
        </canvas>

        {/* Controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-20 flex justify-center space-x-2">
          <button
            onClick={handlePlay}
            className={`px-3 py-1 rounded ${
              isAnimating
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-green-500 hover:bg-green-600"
            } text-white focus:outline-none`}
          >
            {isAnimating ? "Pause" : "Play"}
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white focus:outline-none"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-500">
        <p>
          LaTeX: <code>{latex}</code>
        </p>
        <p>Animation Progress: {Math.round(animationProgress * 100)}%</p>
      </div>
    </div>
  );
}
