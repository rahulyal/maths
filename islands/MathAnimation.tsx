// islands/MathAnimation.tsx
import {
  Dispatch,
  StateUpdater,
  useEffect,
  useRef,
  useState,
} from "preact/hooks";
import { CanvasEngine } from "../core/canvas/engine.ts";
import { CanvasConfig } from "../schemas/canvas.ts";
import { SVGElement } from "../utils/anime.ts";
import { SVGRenderer } from "../core/math/svg-renderer.ts";
import { createMathAnimation, mapAnimationToElements } from "../utils/anime.ts";
import { Timeline } from "animejs";

interface MathAnimationProps {
  latex: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  loop?: boolean;
  duration?: number;
}

// Declare prepareMathAnimation at the module level to avoid "no-inner-declarations" lint error
async function prepareMathAnimation(
  latex: string,
  engine: CanvasEngine,
  duration: number,
  autoplay: boolean,
  addDebugMessage: (msg: string) => void,
  setStatus: (status: "loading" | "error" | "ready") => void,
  setError: (error: string) => void,
  setAnimationState: Dispatch<
    StateUpdater<{
      timeline: Timeline | null;
      renderer: SVGRenderer | null;
      elements: SVGElement[];
      viewBox: number[];
      playing: boolean;
    }>
  >,
  startAnimation: (
    timeline: Timeline,
    renderer: SVGRenderer,
    elements: SVGElement[],
  ) => void,
  width: number,
  height: number,
) {
  try {
    setStatus("loading");
    addDebugMessage("Fetching SVG data from server");

    const response = await fetch("/api/tex-to-svg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        latex,
        extractStructured: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to convert LaTeX");
    }

    const data = await response.json();
    addDebugMessage(
      `Received data: ${JSON.stringify(data).substring(0, 100)}...`,
    );

    const { svg, viewBox, elements } = data;

    if (!svg || !elements) {
      throw new Error("Failed to get SVG data");
    }

    addDebugMessage(`Got SVG with ${elements.length} root elements`);

    // Create renderer
    addDebugMessage("Creating SVGRenderer");
    const renderer = new SVGRenderer(
      engine,
      viewBox || [0, 0, 100, 50],
      width,
      height,
    );

    // Test render a simple rectangle to verify the canvas context is working
    try {
      const ctx = engine.getContext();
      ctx.fillStyle = "#000000";
      ctx.fillRect(10, 10, 50, 50);
      engine.present();
      addDebugMessage("Test rectangle drawn successfully");
    } catch (e) {
      addDebugMessage(`Error drawing test rectangle: ${e}`);
    }

    // Create animation timeline
    addDebugMessage("Creating animation timeline");
    const timeline = createMathAnimation(elements, {
      duration: duration,
      easing: "easeOutQuad",
    });

    setAnimationState({
      timeline,
      renderer,
      elements,
      viewBox: viewBox || [0, 0, 100, 50],
      playing: false,
    });

    setStatus("ready");
    addDebugMessage("Animation ready");

    // Start animation if autoplay is enabled
    if (autoplay) {
      addDebugMessage("Starting animation (autoplay)");
      startAnimation(timeline, renderer, elements);
    }
  } catch (err) {
    console.error("Error in LaTeX conversion:", err);
    addDebugMessage(
      `Error: ${err instanceof Error ? err.message : String(err)}`,
    );
    setError(err instanceof Error ? err.message : String(err));
    setStatus("error");
  }
}

export function MathAnimation({
  latex,
  width = 800,
  height = 400,
  autoplay = true,
  loop = false,
  duration = 2000,
}: MathAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">(
    "loading",
  );
  const [error, setError] = useState<string>("");
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const [animationState, setAnimationState] = useState<{
    timeline: Timeline | null;
    renderer: SVGRenderer | null;
    elements: SVGElement[];
    viewBox: number[];
    playing: boolean;
  }>({
    timeline: null,
    renderer: null,
    elements: [],
    viewBox: [0, 0, 0, 0],
    playing: false,
  });

  // Debugging helper function
  const addDebugMessage = (message: string) => {
    setDebugMessages((prev) => [...prev.slice(-9), message]); // Keep last 10 messages
  };

  // Function to start animation
  const startAnimation = (
    timeline: Timeline,
    renderer: SVGRenderer,
    elements: SVGElement[],
  ) => {
    if (!timeline || !renderer) {
      addDebugMessage("Cannot start animation: missing timeline or renderer");
      return;
    }

    try {
      setAnimationState((prev) => ({ ...prev, playing: true }));

      // Reset timeline
      timeline.restart();
      addDebugMessage("Animation timeline restarted");

      // Animation render loop
      if (!canvasRef.current) {
        addDebugMessage("Canvas reference lost");
        return;
      }

      const config: CanvasConfig = {
        width,
        height,
        dpi: globalThis.devicePixelRatio || 1,
        backgroundColor: "#ffffff",
      };

      const engine = new CanvasEngine(canvasRef.current, config);
      addDebugMessage("Engine created for animation loop");

      let animationFrameId: number;
      let lastProgress = -1;

      const animate = () => {
        try {
          // Only log if progress changed significantly
          if (Math.abs(timeline.progress - lastProgress) > 5) {
            addDebugMessage(
              `Animation progress: ${timeline.progress.toFixed(1)}%`,
            );
            lastProgress = timeline.progress;
          }

          // Clear canvas
          engine.clear();

          // Get progress for each element
          const _elementProgress = mapAnimationToElements(timeline, elements);

          // Render with current progress
          renderer.render(elements, timeline.progress / 100);

          // Present the frame
          engine.present();

          // Continue if still playing
          if (timeline.progress < 100) {
            animationFrameId = requestAnimationFrame(animate);
          } else if (loop) {
            // Loop if enabled
            timeline.restart();
            animationFrameId = requestAnimationFrame(animate);
          } else {
            setAnimationState((prev) => ({ ...prev, playing: false }));
            addDebugMessage("Animation complete");
          }
        } catch (e) {
          addDebugMessage(`Animation error: ${e}`);
          console.error("Animation error:", e);
        }
      };

      // Start animation loop
      addDebugMessage("Starting animation loop");
      animationFrameId = requestAnimationFrame(animate);

      // Cleanup function
      return () => {
        cancelAnimationFrame(animationFrameId);
        timeline.pause();
        addDebugMessage("Animation stopped");
      };
    } catch (e) {
      addDebugMessage(`Error in startAnimation: ${e}`);
      console.error("Error starting animation:", e);
    }
  };

  // Handle play button click
  const _handlePlay = () => {
    if (animationState.timeline && animationState.renderer) {
      addDebugMessage(
        animationState.playing ? "Pausing animation" : "Playing animation",
      );

      if (animationState.playing) {
        animationState.timeline.pause();
        setAnimationState((prev) => ({ ...prev, playing: false }));
      } else {
        if (animationState.timeline.progress >= 100) {
          animationState.timeline.restart();
        } else {
          animationState.timeline.play();
        }
        startAnimation(
          animationState.timeline,
          animationState.renderer,
          animationState.elements,
        );
      }
    } else {
      addDebugMessage("Cannot play/pause: missing timeline or renderer");
    }
  };

  // Handle reset button click
  const _handleReset = () => {
    try {
      if (animationState.timeline && animationState.renderer) {
        addDebugMessage("Resetting animation");
        animationState.timeline.restart();
        animationState.timeline.pause();

        // Render the first frame
        if (!canvasRef.current) {
          addDebugMessage("Canvas reference lost during reset");
          return;
        }

        const config: CanvasConfig = {
          width,
          height,
          dpi: globalThis.devicePixelRatio || 1,
          backgroundColor: "#ffffff",
        };

        const engine = new CanvasEngine(canvasRef.current, config);

        engine.clear();
        animationState.renderer.render(animationState.elements, 0);
        engine.present();

        setAnimationState((prev) => ({ ...prev, playing: false }));
        addDebugMessage("Animation reset complete");
      } else {
        addDebugMessage("Cannot reset: missing timeline or renderer");
      }
    } catch (e) {
      addDebugMessage(`Error in handleReset: ${e}`);
      console.error("Error resetting animation:", e);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !latex) return;

    addDebugMessage(`Initializing canvas for: ${latex}`);

    // Draw a simple test pattern to check canvas is working
    const testCtx = canvasRef.current.getContext("2d");
    if (testCtx) {
      testCtx.fillStyle = "#e0e0e0";
      testCtx.fillRect(0, 0, width, height);
      testCtx.strokeStyle = "#ff0000";
      testCtx.lineWidth = 2;
      testCtx.beginPath();
      testCtx.moveTo(10, 10);
      testCtx.lineTo(width - 10, height - 10);
      testCtx.stroke();
      testCtx.beginPath();
      testCtx.moveTo(width - 10, 10);
      testCtx.lineTo(10, height - 10);
      testCtx.stroke();
      testCtx.fillStyle = "#000000";
      testCtx.font = "20px sans-serif";
      testCtx.fillText("Testing Canvas", width / 2 - 80, height / 2);
      addDebugMessage("Drew test pattern");
    } else {
      addDebugMessage("Failed to get 2D context for test pattern");
    }

    // Set up canvas engine
    try {
      const config: CanvasConfig = {
        width,
        height,
        dpi: globalThis.devicePixelRatio || 1,
        backgroundColor: "#ffffff",
      };

      addDebugMessage(
        `Creating CanvasEngine with config: ${JSON.stringify(config)}`,
      );
      const engine = new CanvasEngine(canvasRef.current, config);
      addDebugMessage("CanvasEngine created successfully");

      // Convert LaTeX to SVG with proper data extraction
      prepareMathAnimation(
        latex,
        engine,
        duration,
        autoplay,
        addDebugMessage,
        setStatus,
        setError,
        setAnimationState,
        startAnimation,
        width,
        height,
      );
    } catch (e) {
      addDebugMessage(`Error initializing: ${e}`);
      setError(`Initialization error: ${e}`);
      setStatus("error");
    }

    // Clean up
    return () => {
      if (animationState.timeline) {
        animationState.timeline.pause();
      }
    };
  }, [latex, width, height, autoplay, duration]);

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
        class={`relative border border-gray-300 rounded-lg overflow-hidden ${
          status !== "ready" ? "hidden" : ""
        }`}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          class="w-full"
        />

        {/* Controls overlay */}
        <div class="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-20 flex justify-center space-x-2">
          <button
            onClick={_handlePlay}
            class={`px-3 py-1 rounded ${
              animationState.playing
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-green-500 hover:bg-green-600"
            } text-white focus:outline-none`}
          >
            {animationState.playing ? "Pause" : "Play"}
          </button>

          <button
            onClick={_handleReset}
            class="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white focus:outline-none"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Debug panel */}
      <div class="mt-2 text-sm text-gray-500">
        <p>
          LaTeX: <code>{latex}</code>
        </p>

        <details>
          <summary class="cursor-pointer font-medium">Debug Info</summary>
          <div class="mt-2 p-2 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap">
            {debugMessages.map((msg, i) => <div key={i}>{msg}</div>)}
          </div>
        </details>
      </div>
    </div>
  );
}
