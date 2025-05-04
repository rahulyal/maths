// routes/test/math-animation.tsx
import { Head } from "$fresh/runtime.ts";
import { MathAnimation } from "../../islands/MathAnimation.tsx";

export default function MathAnimationTest() {
  return (
    <>
      <Head>
        <title>Math Animation Test</title>
      </Head>
      <div class="container mx-auto py-8 px-4">
        <h1 class="text-3xl font-bold mb-6">Math Animation Test</h1>

        <div class="grid gap-8">
          {/* Simple equation */}
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Basic Equation</h2>
            <MathAnimation latex="E = mc^2" />
          </div>

          {/* More complex equation */}
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Derivative</h2>
            <MathAnimation latex="\frac{d}{dx}(x^2) = 2x" />
          </div>

          {/* Complex mathematical expression */}
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Complex Expression</h2>
            <MathAnimation
              latex="\int_{a}^{b} f(x) \, dx = F(b) - F(a)"
              height={300}
            />
          </div>
        </div>
      </div>
    </>
  );
}
