// routes/api/latex-to-svg.ts
import { extractPathsFromSVG, texToSVG } from "../../utils/mathjax.ts";

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

    // Convert LaTeX to SVG
    const svgString = texToSVG(body.latex, body.options || undefined);

    // Extract path data if requested
    let result;
    if (body.extractPaths) {
      const paths = extractPathsFromSVG(
        typeof svgString === "string" ? svgString : svgString.svgString,
      );
      result = { svg: svgString, paths };
    } else {
      result = { svg: svgString };
    }

    // Return the SVG and optional path data
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error converting LaTeX to SVG:", error);

    return new Response(
      JSON.stringify({ error: "Failed to convert LaTeX to SVG" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
