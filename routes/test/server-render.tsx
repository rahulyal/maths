import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { renderLatex } from "../../utils/katex.ts";

// Equations to render on the server
const SERVER_RENDERED_EQUATIONS = [
  {
    latex: "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}",
    name: "Gaussian Integral",
    description: "A fundamental result in mathematics with applications in probability theory"
  },
  {
    latex: "\\frac{d}{dx}[\\sin(x)] = \\cos(x)",
    name: "Derivative of Sine",
    description: "A basic calculus result for the sine function"
  }
];

// Server-side rendering
export const handler: Handlers = {
  GET(req, ctx) {
    // Pre-render equations on the server
    const renderedEquations = SERVER_RENDERED_EQUATIONS.map(eq => ({
      ...eq,
      html: renderLatex(eq.latex)
    }));
    
    return ctx.render({ renderedEquations });
  }
}

export default function ServerRenderPage({ data }: PageProps) {
  const { renderedEquations } = data;
  
  return (
    <>
      <Head>
        <title>Server-Rendered KaTeX</title>
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
        />
      </Head>
      
      <div class="container mx-auto py-8 px-4">
        <h1 class="text-3xl font-bold mb-6">KaTeX Rendering Examples</h1>
        
        <section class="mb-12">
          <h2 class="text-2xl font-semibold mb-4">Server-Side Rendered Equations</h2>
          <p class="mb-4 text-gray-700">
            These equations were pre-rendered on the server using our reusable KaTeX utility.
          </p>
          
          <div class="grid gap-6 md:grid-cols-2">
            {renderedEquations.map((eq, i) => (
              <div key={i} class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="font-semibold text-lg mb-2">{eq.name}</h3>
                <p class="text-sm text-gray-600 mb-4">{eq.description}</p>
                <div 
                  class="katex-display bg-gray-50 p-4 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: eq.html }}
                />
              </div>
            ))}
          </div>
        </section>
        
        <section class="mb-8">
          <h2 class="text-2xl font-semibold mb-4">Client-Side Animated Equations</h2>
          <p class="mb-4 text-gray-700">
            Visit the <a href="/test/katexmath" class="text-blue-600 hover:underline">KaTeX Animation Demo</a> to see 
            client-side animated equations using the same utility functions.
          </p>
        </section>
        
        <div class="bg-blue-50 p-6 rounded-lg">
          <h3 class="font-semibold mb-2">How It Works</h3>
          <p class="mb-4">
            We've created a reusable KaTeX utility that works in both environments:
          </p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Server-side: Pre-render equations for initial HTML</li>
            <li>Client-side: Add animations and interactive features</li>
            <li>Same core rendering logic for both contexts</li>
          </ul>
        </div>
      </div>
    </>
  );
}