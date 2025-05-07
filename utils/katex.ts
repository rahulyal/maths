// Utility functions for rendering KaTeX mathematical expressions
import katex from "katex";

export interface KatexRenderOptions {
  displayMode?: boolean;
  throwOnError?: boolean;
  errorColor?: string;
  fontSize?: number;
  customClass?: string;
}

/**
 * Renders a LaTeX expression using KaTeX
 * Works in both client and server environments
 * 
 * @param latex The LaTeX expression to render
 * @param options Rendering options
 * @returns HTML string of the rendered expression
 */
export function renderLatex(latex: string, options: KatexRenderOptions = {}): string {
  try {
    // Default options
    const defaultOptions = {
      displayMode: true,
      throwOnError: false,
      errorColor: "#cc0000",
      ...options,
    };
    
    // Use KaTeX to generate HTML
    return katex.renderToString(latex, defaultOptions);
  } catch (error) {
    console.error("Error rendering KaTeX:", error);
    
    // Return a fallback if rendering fails
    if (options.throwOnError) {
      throw error;
    }
    
    return `<span style="color: ${options.errorColor || '#cc0000'}">Error rendering: ${latex}</span>`;
  }
}

/**
 * Create a styled container for a KaTeX expression with animation
 * Note: This is client-side only functionality
 * 
 * @param latex The LaTeX expression to render
 * @param animationDuration Duration of animation in ms
 * @param options Rendering options
 * @returns HTML element with the rendered expression
 */
export function createAnimatedLatexElement(
  latex: string, 
  animationDuration: number = 1500,
  options: KatexRenderOptions = {}
): HTMLElement {
  // Create container for animated expression
  const container = document.createElement("div");
  
  // Apply styles for animation
  container.style.opacity = "0";
  container.style.transition = `opacity ${animationDuration/1000}s ease`;
  
  // Apply custom class if provided
  if (options.customClass) {
    container.className = options.customClass;
  } else {
    container.className = "katex-animated";
  }
  
  // Set font size if provided
  if (options.fontSize) {
    container.style.fontSize = `${options.fontSize}px`;
  }
  
  // Render the expression
  const renderedHTML = renderLatex(latex, options);
  container.innerHTML = renderedHTML;
  
  // Trigger animation after a small delay to ensure proper rendering
  setTimeout(() => {
    container.style.opacity = "1";
  }, 10);
  
  return container;
}

/**
 * Ensures KaTeX styles are loaded in the document
 * Client-side only
 */
export function ensureKatexStyles(): void {
  if (typeof document !== 'undefined' && !document.querySelector('link[href*="katex"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
    document.head.appendChild(link);
  }
}

/**
 * A complete utility for rendering animated KaTeX in a specific element
 * Client-side only
 * 
 * @param latex The LaTeX expression to render
 * @param targetElement Element to render into
 * @param animationDuration Duration of animation in ms
 * @param options Rendering options
 */
export function renderAnimatedLatex(
  latex: string,
  targetElement: HTMLElement,
  animationDuration: number = 1500,
  options: KatexRenderOptions = {}
): void {
  // Make sure styles are loaded
  ensureKatexStyles();
  
  // Clear the target element
  targetElement.innerHTML = '';
  
  // Create and append the animated element
  const animatedElement = createAnimatedLatexElement(latex, animationDuration, options);
  targetElement.appendChild(animatedElement);
}