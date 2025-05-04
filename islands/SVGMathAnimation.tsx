// islands/SVGMathAnimation.tsx
import { useEffect, useRef, useState } from "preact/hooks";
import { animate, createTimeline, stagger, svg } from "animejs";

// Create a setDashoffset helper function since we can't access the global anime object
function setDashoffset(el: SVGPathElement): number {
  const pathLength = el.getTotalLength();
  el.setAttribute("stroke-dasharray", pathLength + " " + pathLength);
  return pathLength;
}

interface SVGMathAnimationProps {
  latex: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  loop?: boolean;
  duration?: number;
}

export default function SVGMathAnimation({
  latex,
  width = 800,
  height = 400,
  autoplay = true,
  loop = false,
  duration = 2000,
}: SVGMathAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [status, setStatus] = useState<"loading" | "error" | "ready">(
    "loading",
  );
  const [error, setError] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const timelineRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Fetch SVG representation of LaTeX
    async function fetchSVG() {
      try {
        setStatus("loading");

        const response = await fetch("/api/tex-to-svg", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latex,
            extractPaths: false, // Just get the raw SVG
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to convert LaTeX");
        }

        const data = await response.json();

        if (!data.svg) {
          throw new Error("Failed to get SVG");
        }

        // Set SVG content
        setSvgContent(data.svg);
        setStatus("ready");

        // Wait for next render cycle when SVG is in the DOM
        setTimeout(() => {
          initAnimation();
        }, 100);
      } catch (err) {
        console.error("Error fetching SVG:", err);
        setError(err instanceof Error ? err.message : String(err));
        setStatus("error");
      }
    }

    fetchSVG();

    return () => {
      // Clean up animation
      if (timelineRef.current) {
        timelineRef.current.pause();
      }
    };
  }, [latex, width, height]);

  // Initialize animation after SVG is in the DOM
  const initAnimation = () => {
    if (!containerRef.current) return;

    try {
      // Find all SVG paths, circles, rects, etc.
      const paths = containerRef.current.querySelectorAll("path");
      const shapes = containerRef.current.querySelectorAll(
        "circle, rect, ellipse, line, polyline, polygon",
      );
      const texts = containerRef.current.querySelectorAll("text");

      console.log(
        `Found ${paths.length} paths, ${shapes.length} shapes, ${texts.length} texts`,
      );

      // Create a timeline for all animations
      const timeline = createTimeline({
        autoplay: false,
        duration: duration,
        easing: "easeOutQuad",
        loop: loop,
      });

      // Animate paths with SVG specific features (stroke drawing)
      if (paths.length > 0) {
        // Initialize paths to be invisible
        paths.forEach((path) => {
          const pathLength = (path as SVGPathElement).getTotalLength() || 1000;
          path.setAttribute("stroke-dasharray", `${pathLength} ${pathLength}`);
          path.setAttribute("stroke-dashoffset", `${pathLength}`);
          path.style.opacity = "1"; // Make visible but with dashoffset
        });

        // Animate paths
        timeline.add({
          targets: Array.from(paths),
          strokeDashoffset: [
            function (el) {
              return (el as SVGPathElement).getTotalLength() || 1000;
            },
            0,
          ],
          easing: "easeInOutSine",
          duration: duration * 0.7,
          delay: stagger(50),
        });
      }

      // Animate other shapes
      if (shapes.length > 0) {
        // Initialize shapes to be invisible
        shapes.forEach((shape) => {
          shape.style.opacity = "0";
          shape.style.transform = "scale(0.8)";
        });

        // Animate shapes
        timeline.add({
          targets: Array.from(shapes),
          opacity: [0, 1],
          scale: [0.8, 1],
          easing: "easeOutElastic(1, .5)",
          duration: duration * 0.6,
          delay: stagger(30, { start: 200 }),
        }, "-=400"); // Slightly overlap with path animation
      }

      // Animate text elements
      if (texts.length > 0) {
        // Initialize text to be invisible
        texts.forEach((text) => {
          text.style.opacity = "0";
        });

        // Animate text
        timeline.add({
          targets: Array.from(texts),
          opacity: [0, 1],
          easing: "easeInQuad",
          duration: duration * 0.5,
          delay: stagger(40, { start: 300 }),
        }, "-=200"); // Slightly overlap with previous animations
      }

      // Store the timeline for controlling it later
      timelineRef.current = timeline;

      // Start if autoplay is enabled
      if (autoplay) {
        timeline.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error initializing animation:", error);
    }
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (!timelineRef.current) return;

    if (isPlaying) {
      timelineRef.current.pause();
    } else {
      timelineRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  // Handle reset
  const handleReset = () => {
    if (!timelineRef.current) return;

    timelineRef.current.restart();
    timelineRef.current.pause();
    setIsPlaying(false);
  };

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
        <div
          ref={containerRef}
          class="w-full h-full bg-white"
          style={{ width: `${width}px`, height: `${height}px` }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        >
        </div>

        {/* Controls overlay */}
        <div class="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-20 flex justify-center space-x-2">
          <button
            onClick={handlePlayPause}
            class={`px-3 py-1 rounded ${
              isPlaying
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-green-500 hover:bg-green-600"
            } text-white focus:outline-none`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={handleReset}
            class="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white focus:outline-none"
          >
            Reset
          </button>
        </div>
      </div>

      <div class="mt-2 text-sm text-gray-500">
        <p>
          LaTeX: <code>{latex}</code>
        </p>
      </div>
    </div>
  );
}
