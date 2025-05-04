// utils/mathjax.ts
import { mathjax } from "npm:mathjax-full/js/mathjax.js";
import { TeX } from "npm:mathjax-full/js/input/tex.js";
import { SVG } from "npm:mathjax-full/js/output/svg.js";
import { liteAdaptor } from "npm:mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "npm:mathjax-full/js/handlers/html.js";
import { AllPackages } from "npm:mathjax-full/js/input/tex/AllPackages.js";

const DEFAULT_OPTIONS = {
  width: 1280,
  ex: 8,
  em: 16,
};

// Initialize MathJax
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const packages = AllPackages.sort().join(", ").split(/\s*,\s*/);
const tex = new TeX({ packages });
const svg = new SVG({ fontCache: "local" });
const html = mathjax.document("", { InputJax: tex, OutputJax: svg });

// CSS for SVG styling
const CSS = [
  "svg a{fill:blue;stroke:blue}",
  '[data-mml-node="merror"]>g{fill:red;stroke:red}',
  '[data-mml-node="merror"]>rect[data-background]{fill:yellow;stroke:none}',
  "[data-frame],[data-line]{stroke-width:70px;fill:none}",
  ".mjx-dashed{stroke-dasharray:140}",
  ".mjx-dotted{stroke-linecap:round;stroke-dasharray:0,140}",
  "use[data-c]{stroke-width:3px}",
].join("");

/**
 * Convert TeX string to SVG
 * @param tex The TeX string to convert
 * @param opts Options for rendering
 * @param getWidth Whether to return the SVG width
 * @returns The SVG string or an object with SVG string and width
 */
export function texToSVG(
  tex: string,
  opts?: Partial<typeof DEFAULT_OPTIONS>,
  getWidth = false,
) {
  const options = opts ? { ...DEFAULT_OPTIONS, ...opts } : DEFAULT_OPTIONS;

  const node = html.convert(tex, {
    display: true,
    em: options.em,
    ex: options.ex,
    containerWidth: options.width,
  });

  let svgString = adaptor.innerHTML(node);
  svgString = svgString.replace(/<defs>/, `<defs><style>${CSS}</style>`);

  if (getWidth) {
    const svgWidth = node.children[0].attributes.viewBox.split(" ")[2];
    return { svgString, svgWidth };
  }

  return svgString;
}

/**
 * Extract path data from SVG for animation
 * @param svgString The SVG string to parse
 * @returns Array of path objects with data and attributes
 */
export function extractPathsFromSVG(svgString: string) {
  // This is a simple implementation that would need to be expanded
  // to properly extract all path data for animation
  const paths: Array<{ d: string; stroke?: string; fill?: string }> = [];

  // Simple regex to extract path elements
  // Note: A real implementation would use a proper XML parser
  const pathRegex = /<path([^>]*)d="([^"]*)"([^>]*)>/g;
  let match;

  while ((match = pathRegex.exec(svgString)) !== null) {
    const fullTag = match[0];
    const d = match[2];

    // Extract stroke and fill if present
    const stroke = fullTag.match(/stroke="([^"]*)"/)?.[1];
    const fill = fullTag.match(/fill="([^"]*)"/)?.[1];

    paths.push({ d, stroke, fill });
  }

  return paths;
}
