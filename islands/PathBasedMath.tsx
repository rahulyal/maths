import { useEffect, useState } from "preact/hooks";
import { LatexToPath } from "../core/math/latex-to-path.ts";
import SVGPathAnimation from "./SVGPathAnimation.tsx";

interface PathBasedMathProps {
  latex: string;
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  duration?: number;
  autoplay?: boolean;
}

export default function PathBasedMath({
  latex,
  width = 800,
  height = 400,
  strokeColor = "#000000",
  strokeWidth = 2,
  duration = 2000,
  autoplay = true,
}: PathBasedMathProps) {
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    // Convert LaTeX to SVG paths
    const converter = new LatexToPath();
    const svgPath = converter.generateSVGPath(latex, 50, height / 2);
    setPaths([svgPath]);
  }, [latex, height]);

  return (
    <div class="path-based-math">
      <div class="grid gap-4">
        {paths.map((path, index) => (
          <SVGPathAnimation
            key={index}
            svgPath={path}
            width={width}
            height={height}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            duration={duration}
            delay={index * 100} // Stagger animation for multiple paths
            autoplay={autoplay}
          />
        ))}
      </div>
    </div>
  );
}
