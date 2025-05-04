// routes/test/svg-math.tsx
import { Head } from "$fresh/runtime.ts";
import SVGMathAnimation from "../../islands/SVGMathAnimation.tsx";

export default function SVGMathTest() {
  return (
    <>
      <Head>
        <title>SVG Math Animation</title>
      </Head>
      <div class="container mx-auto py-8 px-4">
        <h1 class="text-3xl font-bold mb-6">SVG Math Animation</h1>
        <p class="text-lg mb-8">
          This page demonstrates math equations using Anime.js's built-in SVG
          animation capabilities.
        </p>

        <div class="grid gap-8">
          {/* Simple equation */}
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">
              Einstein's Famous Equation
            </h2>
            <SVGMathAnimation
              latex="E = mc^2"
              width={600}
              height={300}
            />
          </div>

          {/* More complex equation */}
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Derivative</h2>
            <SVGMathAnimation
              latex="\\frac{d}{dx}(x^2) = 2x"
              width={600}
              height={300}
            />
          </div>

          {/* Complex mathematical expression */}
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Integration by Parts</h2>
            <SVGMathAnimation
              latex="\\int_{a}^{b} u(x)v'(x) \\, dx = [u(x)v(x)]_{a}^{b} - \\int_{a}^{b} u'(x)v(x) \\, dx"
              width={600}
              height={300}
            />
          </div>

          {/* Quadratic Formula */}
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Quadratic Formula</h2>
            <SVGMathAnimation
              latex="x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
              width={600}
              height={300}
              duration={3000}
            />
          </div>
        </div>
      </div>
    </>
  );
}
