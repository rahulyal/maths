import { CanvasEngine } from "../canvas/engine.ts";
import { MathEquation } from "../../schemas/math.ts";
import katex from "katex";

/**
 * Renderer for mathematical equations using KaTeX with handwritten animation effect.
 * Uses CSS-based animations for a handwritten appearance, then captures to canvas.
 */
export class KaTeXHandwrittenRenderer {
  private engine: CanvasEngine;
  private equation: MathEquation;
  private container: HTMLDivElement;
  public animationProgress: number = 0;
  private animationStartTime: number = 0;
  private isAnimated: boolean = false;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenContext: CanvasRenderingContext2D | null;
  private styleElement: HTMLStyleElement | null = null;
  private uniqueId: string;

  constructor(engine: CanvasEngine, equation: MathEquation) {
    this.engine = engine;
    this.equation = equation;
    this.uniqueId = `katex-${Math.random().toString(36).substring(2, 9)}`;

    // Create container for KaTeX rendering
    this.container = document.createElement("div");
    this.container.style.position = "absolute";
    this.container.style.left = "0";
    this.container.style.top = "0";
    this.container.style.visibility = "visible";
    this.container.style.pointerEvents = "none";
    this.container.id = this.uniqueId;
    document.body.appendChild(this.container);

    // Create offscreen canvas for rendering
    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenCanvas.width = 1000; // Initial size, will be adjusted
    this.offscreenCanvas.height = 400;
    this.offscreenContext = this.offscreenCanvas.getContext("2d");

    // Render equation and setup animations
    this.renderEquation();
  }

  /**
   * Renders the LaTeX equation using KaTeX and sets up handwritten animations
   */
  private renderEquation(): void {
    try {
      // Apply KaTeX styles if not already loaded
      this.ensureKaTeXStyles();

      // Render LaTeX with KaTeX
      katex.render(this.equation.latex, this.container, {
        displayMode: true,
        output: "html",
        throwOnError: false,
        errorColor: "#cc0000",
      });

      // Calculate size based on rendered content
      const rect = this.container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        // Adjust offscreen canvas size with padding
        this.offscreenCanvas.width = rect.width + 40;
        this.offscreenCanvas.height = rect.height + 40;
      }

      // Setup CSS for handwritten animation
      this.setupHandwrittenEffect();
      this.isAnimated = true;
    } catch (error) {
      console.error("KaTeX rendering error:", error);
      // Fallback to basic rendering if KaTeX fails
      this.container.textContent = this.equation.latex;
    }
  }

  /**
   * Ensures KaTeX CSS is loaded
   */
  private ensureKaTeXStyles(): void {
    if (!document.querySelector('link[href*="katex"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
      document.head.appendChild(link);
    }
  }

  /**
   * Sets up CSS animations for handwritten effect
   */
  private setupHandwrittenEffect(): void {
    // Create style element for our animations
    this.styleElement = document.createElement("style");
    document.head.appendChild(this.styleElement);

    // Add container class for scoping animations
    this.container.classList.add("katex-handwritten");

    // Base CSS for handwritten appearance
    const baseCSS = `
      .katex-handwritten {
        font-family: 'Nanum Pen Script', 'Dancing Script', cursive, 'KaTeX_Main', sans-serif;
      }

      #${this.uniqueId} .katex .mord,
      #${this.uniqueId} .katex .mbin,
      #${this.uniqueId} .katex .mrel,
      #${this.uniqueId} .katex .mopen,
      #${this.uniqueId} .katex .mclose,
      #${this.uniqueId} .katex .minner {
        opacity: 0;
      }

      @keyframes fadeWriteIn {
        0% {
          opacity: 0;
          transform: scale(0.95) translate(-2px, 2px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translate(0, 0);
        }
      }

      @keyframes drawStroke {
        from { stroke-dashoffset: 1; }
        to { stroke-dashoffset: 0; }
      }

      @keyframes growLine {
        from { transform: scaleX(0); }
        to { transform: scaleX(1); }
      }
    `;

    this.styleElement.textContent = baseCSS;

    // Get all elements to animate
    const elements = this.container.querySelectorAll(
      ".katex .mord, .katex .mbin, .katex .mrel, .katex .mopen, .katex .mclose, .katex .minner",
    );

    // Prepare CSS animation rules
    let animationRules = "";

    // Add animation rules for each element with staggered delays
    elements.forEach((el, index) => {
      // Add unique class to element
      const className = `anim-${this.uniqueId}-${index}`;
      el.classList.add(className);

      // Calculate delay based on position in equation
      const delayFactor = index / elements.length;
      const delay = delayFactor * this.equation.animationDuration * 0.8; // Use 80% of time for staggering

      // Add slight randomness to rotation for handwritten feel
      const randomRotation = Math.random() * 4 - 2; // -2 to +2 degrees

      // Create animation rule for this element
      animationRules += `
        #${this.uniqueId} .${className} {
          animation: fadeWriteIn 0.3s forwards;
          animation-delay: ${delay}ms;
          transform-origin: center center;
          transform: rotate(${randomRotation}deg);
          will-change: opacity, transform;
        }
      `;
    });

    // Handle fraction lines specially
    const fractionLines = this.container.querySelectorAll(".katex .frac-line");
    fractionLines.forEach((line, index) => {
      const className = `frac-${this.uniqueId}-${index}`;
      line.classList.add(className);

      const delayFactor = 0.7; // Delay fraction lines until numerator is shown
      const delay = delayFactor * this.equation.animationDuration;

      animationRules += `
        #${this.uniqueId} .${className} {
          transform-origin: left center;
          transform: scaleX(0);
          animation: growLine 0.3s forwards;
          animation-delay: ${delay}ms;
          will-change: transform;
        }
      `;
    });

    // Handle SVG elements (like sqrt signs)
    const svgElements = this.container.querySelectorAll(".katex svg path");
    svgElements.forEach((path, index) => {
      try {
        const svgPath = path as SVGPathElement;
        const className = `svg-${this.uniqueId}-${index}`;
        svgPath.classList.add(className);

        // Set up for stroke animation
        svgPath.setAttribute("stroke-dasharray", "1");
        svgPath.setAttribute("stroke-dashoffset", "1");

        const delayFactor = 0.5 + (index / svgElements.length * 0.4);
        const delay = delayFactor * this.equation.animationDuration;

        animationRules += `
          #${this.uniqueId} .${className} {
            animation: drawStroke 0.5s forwards;
            animation-delay: ${delay}ms;
            stroke-width: 1;
            will-change: stroke-dashoffset;
          }
        `;
      } catch (e) {
        // Skip elements that can't be animated
      }
    });

    // Add all animation rules to style element
    if (this.styleElement) {
      this.styleElement.textContent += animationRules;
    }
  }

  /**
   * Updates animation progress based on elapsed time
   */
  update(deltaTime: number): void {
    if (!this.isAnimated) return;

    if (this.animationStartTime === 0) {
      this.animationStartTime = performance.now();
    }

    const elapsed = performance.now() - this.animationStartTime;
    this.animationProgress = Math.min(
      elapsed / this.equation.animationDuration,
      1,
    );

    // Render to offscreen canvas
    this.renderToOffscreenCanvas();
  }

  /**
   * Renders the HTML content to the offscreen canvas
   */
  private renderToOffscreenCanvas(): void {
    if (!this.offscreenContext) return;

    // Clear the offscreen canvas
    this.offscreenContext.clearRect(
      0,
      0,
      this.offscreenCanvas.width,
      this.offscreenCanvas.height,
    );

    // Draw white background (optional)
    // this.offscreenContext.fillStyle = "white";
    // this.offscreenContext.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);

    // Create a data URL from the HTML
    const data = new XMLSerializer().serializeToString(this.container);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${this.offscreenCanvas.width}" height="${this.offscreenCanvas.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${data}
          </div>
        </foreignObject>
      </svg>
    `;

    // Create an image from the SVG
    const img = new Image();
    const svgBlob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);

    // Load the image and draw to canvas
    img.onload = () => {
      if (this.offscreenContext) {
        // Center the content on the canvas with padding
        const x = 20; // Left padding
        const y = 20; // Top padding
        this.offscreenContext.drawImage(img, x, y);
      }
      URL.revokeObjectURL(url);
    };

    img.onerror = (err) => {
      console.error("Error loading equation image:", err);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }

  /**
   * Renders the equation to the main canvas
   */
  render(): void {
    const ctx = this.engine.getContext();

    ctx.save();

    // Position at the specified coordinates
    ctx.translate(this.equation.position.x, this.equation.position.y);

    // Draw the offscreen canvas to the main canvas
    ctx.drawImage(this.offscreenCanvas, 0, 0);

    ctx.restore();
  }

  /**
   * Cleans up resources
   */
  dispose(): void {
    // Remove the container
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    // Remove the style element
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
    }

    // Clear references
    this.offscreenContext = null;
  }
}
