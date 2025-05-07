import { useEffect, useRef, useState } from "preact/hooks";
import { ensureKatexStyles, renderAnimatedLatex } from "../utils/katex.ts";

const EXAMPLE_EQUATIONS = [
  {
    latex: "E = mc^2",
    name: "Einstein's Equation",
    description: "The mass-energy equivalence formula",
  },
  {
    latex: "\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    name: "Quadratic Formula",
    description: "Solves quadratic equations of the form ax² + bx + c = 0",
  },
  {
    latex: "\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}",
    name: "Sum of Integers",
    description: "Formula for the sum of first n natural numbers",
  },
  {
    latex: "\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)",
    name: "Fundamental Theorem of Calculus",
    description: "Relates differentiation and integration",
  },
  {
    latex: "e^{i\\pi} + 1 = 0",
    name: "Euler's Identity",
    description: "Connects five fundamental mathematical constants",
  },
  {
    latex:
      "\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}",
    name: "Maxwell's Equation (Faraday's Law)",
    description:
      "Describes how a changing magnetic field creates an electric field",
  },
];

export function KatexMath() {
  const [currentEquation, setCurrentEquation] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const katexRef = useRef<HTMLDivElement>(null);

  // Function to render the KaTeX equation
  useEffect(() => {
    // Ensure KaTeX styles are loaded
    ensureKatexStyles();

    if (katexRef.current) {
      setAnimating(true);

      // Use our utility function to render animated LaTeX
      renderAnimatedLatex(
        EXAMPLE_EQUATIONS[currentEquation].latex,
        katexRef.current,
        1500 / animationSpeed,
        { fontSize: 24, customClass: "katex-display p-8 text-3xl" },
      );

      // Set animating to false after animation completes
      const timer = setTimeout(() => {
        setAnimating(false);
      }, 1500 / animationSpeed);

      return () => clearTimeout(timer);
    }
  }, [currentEquation, animationSpeed]);

  const playNextEquation = () => {
    if (animating) return;
    setCurrentEquation((prev) => (prev + 1) % EXAMPLE_EQUATIONS.length);
  };

  const playPreviousEquation = () => {
    if (animating) return;
    setCurrentEquation((prev) =>
      (prev - 1 + EXAMPLE_EQUATIONS.length) % EXAMPLE_EQUATIONS.length
    );
  };

  const replayAnimation = () => {
    if (animating) return;

    // Simply re-render the current equation to restart animation
    if (katexRef.current) {
      setAnimating(true);

      renderAnimatedLatex(
        EXAMPLE_EQUATIONS[currentEquation].latex,
        katexRef.current,
        1500 / animationSpeed,
        { fontSize: 24, customClass: "katex-display p-8 text-3xl" },
      );

      // Set animating to false after animation completes
      setTimeout(() => {
        setAnimating(false);
      }, 1500 / animationSpeed);
    }
  };

  return (
    <div class="p-4 max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">Math Equations Demo</h2>

      <div class="border border-gray-300 rounded-lg overflow-hidden shadow-lg mb-6 bg-white relative">
        <div class="w-full h-[400px] flex items-center justify-center">
          <div ref={katexRef}></div>
        </div>
      </div>

      <div class="flex items-center justify-between mb-6">
        <button
          onClick={playPreviousEquation}
          disabled={animating}
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          Previous
        </button>

        <div class="text-center">
          <h3 class="font-semibold text-lg">
            {EXAMPLE_EQUATIONS[currentEquation].name}
          </h3>
          <p class="text-gray-600 text-sm mb-2">
            {EXAMPLE_EQUATIONS[currentEquation].description}
          </p>
          <code class="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            {EXAMPLE_EQUATIONS[currentEquation].latex}
          </code>
        </div>

        <button
          onClick={playNextEquation}
          disabled={animating}
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          Next
        </button>
      </div>

      <div class="flex items-center justify-between gap-4 mb-4">
        <div class="flex items-center gap-2 flex-1">
          <span class="text-sm font-medium">Animation Speed:</span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={animationSpeed}
            onChange={(e) =>
              setAnimationSpeed(
                parseFloat((e.target as HTMLInputElement).value),
              )}
            class="flex-1"
            disabled={animating}
          />
          <span class="text-sm font-medium">{animationSpeed.toFixed(1)}x</span>
        </div>

        <button
          onClick={replayAnimation}
          disabled={animating}
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
        >
          Replay Animation
        </button>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="font-semibold mb-2">About This Demo</h3>
        <p>
          This demo showcases KaTeX rendering with fade-in animations. Each
          equation is rendered with proper mathematical typesetting and smoothly
          fades in. The equations can be viewed in sequence and the animation
          speed can be adjusted.
        </p>
      </div>
    </div>
  );
}
