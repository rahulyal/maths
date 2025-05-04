// routes/api/tex-to-svg.ts
// Function to create proper SVG with animated paths
function createAnimatableSvg(tex: string): string {
  // Clean the input
  const cleanedTex = tex.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Create SVG with different parts designed for animation
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100">
    <!-- Background grid for reference -->
    <g id="grid" stroke="#f0f0f0" stroke-width="0.5">
      ${
    Array.from({ length: 10 }, (_, i) =>
      `<line x1="0" y1="${i * 10}" x2="200" y2="${i * 10}" />`).join("")
  }
      ${
    Array.from({ length: 20 }, (_, i) =>
      `<line x1="${i * 10}" y1="0" x2="${i * 10}" y2="100" />`).join("")
  }
    </g>

    <!-- Main equation group -->
    <g id="equation" transform="translate(10, 50)">
      <!-- Equation text -->
      <text id="main-formula" x="80" y="0" font-family="serif" font-size="18" text-anchor="middle">${cleanedTex}</text>

      <!-- Decorative underline -->
      <path id="underline" d="M 20 10 Q 80 20 140 10" stroke="#333" stroke-width="1.5" fill="none" />

      <!-- Highlight circle -->
      <circle id="highlight" cx="80" cy="-5" r="30" stroke="#3498db" stroke-width="1.5" fill="none" />

      <!-- Arrows -->
      <path id="arrow1" d="M 20 -20 L 60 -30" stroke="#e74c3c" stroke-width="2" fill="none" marker-end="url(#arrowhead)" />
      <path id="arrow2" d="M 140 -20 L 100 -30" stroke="#e74c3c" stroke-width="2" fill="none" marker-end="url(#arrowhead)" />
    </g>

    <!-- Definitions -->
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#e74c3c" />
      </marker>
    </defs>
  </svg>`;
}

// Basic function to add more paths and elements to an SVG based on equation type
function enhanceSvgForEquation(svg: string, latex: string): string {
  // Insert additional elements based on equation type before the closing </svg>
  let additionalElements = "";

  if (latex.includes("=")) {
    // Add equals sign emphasis
    additionalElements += `
      <g transform="translate(100, 50)">
        <path d="M -15 0 L 15 0 M -15 -5 L 15 -5" stroke="#e74c3c" stroke-width="2" fill="none" />
      </g>
    `;
  }

  if (latex.includes("frac")) {
    // Add fraction line and arrows
    additionalElements += `
      <g transform="translate(100, 50)">
        <path d="M -30 0 L 30 0" stroke="#2ecc71" stroke-width="2" fill="none" />
        <path d="M 0 -15 C 10 -5 10 5 0 15" stroke="#3498db" stroke-width="1.5" fill="none" />
      </g>
    `;
  }

  if (latex.includes("int")) {
    // Add integral decoration
    additionalElements += `
      <g transform="translate(30, 50)">
        <path d="M 0 -30 C -10 -20 -10 20 0 30 C 10 20 10 -20 0 -30 Z" stroke="#8e44ad" stroke-width="1.5" fill="none" />
      </g>
    `;
  }

  // Insert before closing tag
  return svg.replace("</svg>", `${additionalElements}</svg>`);
}

export const handler = async (req: Request): Promise<Response> => {
  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    // Parse the request body
    const body = await req.json();

    if (!body.latex) {
      return new Response(
        JSON.stringify({ error: "LaTeX content is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Generate SVG string with animation-friendly structure
    let svgString = createAnimatableSvg(body.latex);

    // Add equation-specific elements
    svgString = enhanceSvgForEquation(svgString, body.latex);

    // Create a response that works well with Anime.js animation
    const result = {
      svg: svgString,
      viewBox: [0, 0, 200, 100],
      width: 200,
      height: 100,
    };

    // Return the SVG and metadata
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating SVG:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate SVG for LaTeX",
        // Provide a minimal error SVG that still works with animation
        svg:
          `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100">
          <rect width="200" height="100" fill="#f8f9fa" />
          <text x="100" y="50" font-family="sans-serif" font-size="14" text-anchor="middle" fill="red">Error rendering equation</text>
          <path d="M 50 70 L 150 70" stroke="red" stroke-width="2" />
        </svg>`,
        viewBox: [0, 0, 200, 100],
        width: 200,
        height: 100,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
