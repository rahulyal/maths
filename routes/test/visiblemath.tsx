// routes/test/visible-math.tsx
import { Head } from "$fresh/runtime.ts";
import VisibleMath from "../../islands/VisibleMath.tsx";

export default function VisibleMathTest() {
  return (
    <>
      <Head>
        <title>Visible Math Test</title>
      </Head>
      <div class="container mx-auto py-8 px-4">
        <h1 class="text-3xl font-bold mb-6">Visible Math Test</h1>
        <p class="text-lg mb-8">
          This page demonstrates math equations with guaranteed visibility,
          without relying on complex SVG rendering or animation systems.
        </p>

        <div class="grid gap-8">
          {/* Simple equation */}
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">
              Einstein's Famous Equation
            </h2>
            <VisibleMath
              latex="E = mc^2"
              width={600}
              height={300}
            />
          </div>

          {/* More complex equation */}
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Derivative</h2>
            <VisibleMath
              latex="\\frac{d}{dx}(x^2) = 2x"
              width={600}
              height={300}
            />
          </div>

          {/* Complex mathematical expression */}
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Integration by Parts</h2>
            <VisibleMath
              latex="\\int_{a}^{b} u(x)v'(x) \\, dx = [u(x)v(x)]_{a}^{b} - \\int_{a}^{b} u'(x)v(x) \\, dx"
              width={600}
              height={300}
            />
          </div>

          {/* Static version */}
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Static Quadratic Formula</h2>
            <VisibleMath
              latex="x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
              width={600}
              height={300}
              animate={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}
