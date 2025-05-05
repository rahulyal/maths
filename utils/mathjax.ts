// // utils/mathjax.ts
// import { SVGElement } from "./anime.ts";

// const DEFAULT_OPTIONS = {
//   width: 1280,
//   ex: 8,
//   em: 16,
// };

// /**
//  * Convert TeX string to SVG
//  * @param tex The TeX string to convert
//  * @param opts Options for rendering
//  * @returns Object with SVG string and metadata
//  */
// export function texToSVG(
//   tex: string,
//   opts?: Partial<typeof DEFAULT_OPTIONS>,
// ) {
//   // This function would normally use MathJax to convert LaTeX to SVG
//   // In a server environment, you would use MathJax-node or similar
//   // In this implementation, we'll use an API endpoint approach

//   // Just return the original TeX for now, actual conversion happens in the API endpoint
//   return {
//     svgString: tex, // Will be processed by the endpoint
//     viewBox: "0 0 100 100",
//     width: "100",
//     height: "100",
//   };
// }

// /**
//  * A simple SVG structure extractor that doesn't rely on DOM APIs
//  * @param svgString The SVG string to parse
//  * @returns Structured representation of the SVG
//  */
// export function extractAnimationData(svgString: string) {
//   // Basic viewBox extraction
//   const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
//   const viewBox = viewBoxMatch
//     ? viewBoxMatch[1].split(/\s+/).map(Number)
//     : [0, 0, 100, 50];

//   // Width and height extraction
//   const widthMatch = svgString.match(/width="([^"]+)"/);
//   const heightMatch = svgString.match(/height="([^"]+)"/);
//   const width = widthMatch ? parseFloat(widthMatch[1]) : 100;
//   const height = heightMatch ? parseFloat(heightMatch[1]) : 50;

//   // For demo purposes, create some structured elements that represent
//   // what we would extract from a real SVG parsing operation
//   const elements: SVGElement[] = [
//     {
//       type: "g",
//       id: "main-group",
//       attributes: {
//         transform: "translate(10, 50)",
//       },
//       children: [
//         {
//           type: "text",
//           id: "main-text",
//           parent: "main-group",
//           attributes: {
//             x: "0",
//             y: "0",
//             "font-family": "serif",
//             "font-size": "20",
//           },
//           content: "Math Formula",
//         },
//         {
//           type: "path",
//           id: "line-1",
//           parent: "main-group",
//           attributes: {
//             d: "M 20 20 L 180 20",
//             stroke: "black",
//             fill: "none",
//           },
//         },
//         {
//           type: "path",
//           id: "curve-1",
//           parent: "main-group",
//           attributes: {
//             d: "M 20 30 Q 100 -20 180 30",
//             stroke: "blue",
//             fill: "none",
//           },
//         },
//       ],
//     },
//     {
//       type: "g",
//       id: "secondary-group",
//       attributes: {
//         transform: "translate(50, 20)",
//       },
//       children: [
//         {
//           type: "rect",
//           id: "background-rect",
//           parent: "secondary-group",
//           attributes: {
//             x: "0",
//             y: "0",
//             width: "100",
//             height: "30",
//             fill: "rgba(200, 200, 255, 0.5)",
//             stroke: "purple",
//           },
//         },
//         {
//           type: "text",
//           id: "secondary-text",
//           parent: "secondary-group",
//           attributes: {
//             x: "10",
//             y: "20",
//             "font-family": "serif",
//             "font-size": "16",
//           },
//           content: "More Math",
//         },
//       ],
//     },
//   ];

//   return {
//     viewBox,
//     width,
//     height,
//     elements,
//   };
// }

// /**
//  * Legacy extraction method for backward compatibility
//  * @deprecated Use extractAnimationData instead
//  */
// export function extractPathsFromSVG(svgString: string) {
//   // Simple regex-based path extraction
//   const paths: Array<{ d: string; stroke?: string; fill?: string }> = [];
//   const pathRegex = /<path([^>]*)d="([^"]*)"([^>]*)>/g;
//   let match;

//   while ((match = pathRegex.exec(svgString)) !== null) {
//     const fullTag = match[0];
//     const d = match[2];

//     // Extract stroke and fill if present
//     const strokeMatch = fullTag.match(/stroke="([^"]*)"/);
//     const fillMatch = fullTag.match(/fill="([^"]*)"/);

//     paths.push({
//       d,
//       stroke: strokeMatch ? strokeMatch[1] : undefined,
//       fill: fillMatch ? fillMatch[1] : undefined,
//     });
//   }

//   return paths;
// }
