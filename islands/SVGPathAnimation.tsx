// islands/SVGPathAnimation.tsx
import { useEffect, useRef, useState } from "preact/hooks";
import { animate } from "animejs";

interface SVGPathAnimationProps {
  svgPath: string;
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  duration?: number;
  delay?: number;
  autoplay?: boolean;
}

export default function SVGPathAnimation({
  svgPath,
  width = 800,
  height = 400,
  strokeColor = "#000000",
  strokeWidth = 2,
  duration = 2000,
  delay = 0,
  autoplay = true,
}: SVGPathAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [animationInstance, setAnimationInstance] = useState<
    ReturnType<typeof animate> | null
  >(null);
  const [pathData, setPathData] = useState<string>(svgPath);

  useEffect(() => {
    // If svgPath starts with '/', it's a file path
    if (svgPath.startsWith("/")) {
      fetch(svgPath)
        .then((response) => response.text())
        .then((svgContent) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(svgContent, "image/svg+xml");
          const pathElements = doc.querySelectorAll("path");
          // Combine all path data if multiple paths exist
          const combinedPath = Array.from(pathElements)
            .map((path) => path.getAttribute("d"))
            .filter(Boolean)
            .join(" ");
          setPathData(combinedPath);
        })
        .catch((error) => console.error("Error loading SVG:", error));
    }
  }, [svgPath]);

  useEffect(() => {
    if (!containerRef.current || !pathData) return;

    // Clear previous content
    containerRef.current.innerHTML = "";

    // Create SVG element
    const svgElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    svgElement.setAttribute("width", width.toString());
    svgElement.setAttribute("height", height.toString());
    svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
    containerRef.current.appendChild(svgElement);

    // Create path element
    const pathElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    pathElement.setAttribute("d", pathData);
    pathElement.setAttribute("fill", "none");
    pathElement.setAttribute("stroke", strokeColor);
    pathElement.setAttribute("stroke-width", strokeWidth.toString());
    svgElement.appendChild(pathElement);

    // Adjust animation logic to animate stroke-dasharray and stroke-dashoffset
    const pathLength = pathElement.getTotalLength();
    pathElement.setAttribute("stroke-dasharray", pathLength.toString());
    pathElement.setAttribute("stroke-dashoffset", pathLength.toString());

    const animation = animate(
      pathElement,
      {
        strokeDashoffset: [pathLength, 0],
        duration: duration,
        delay: delay,
        easing: "easeInOutSine",
        autoplay: autoplay,
      },
    );

    setAnimationInstance(animation);

    return () => {
      if (animation) {
        animation.pause();
      }
    };
  }, [
    pathData,
    width,
    height,
    strokeColor,
    strokeWidth,
    duration,
    delay,
    autoplay,
  ]);

  const handlePlayPause = () => {
    if (!animationInstance) return;

    if (isPlaying) {
      animationInstance.pause();
    } else {
      animationInstance.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    if (!animationInstance) return;

    animationInstance.restart();
    setIsPlaying(true);
  };

  return (
    <div className="svg-path-animation">
      <div
        ref={containerRef}
        className="svg-container border border-gray-300 rounded-lg overflow-hidden bg-white"
      />

      <div className="controls mt-4 flex space-x-2">
        <button
          type="button"
          onClick={handlePlayPause}
          className={`px-3 py-1 rounded ${
            isPlaying
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-green-500 hover:bg-green-600"
          } text-white focus:outline-none`}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          type="button"
          onClick={handleRestart}
          className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white focus:outline-none"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
