// routes/test/svg-path.tsx
import { Head } from "$fresh/runtime.ts";
import SVGPathAnimation from "../../islands/SVGPathAnimation.tsx";

export default function SVGPathTest() {
  return (
    <>
      <Head>
        <title>SVG Path Animation Test</title>
      </Head>
      <div class="container mx-auto py-8 px-4">
        <h1 class="text-3xl font-bold mb-6">SVG Path Animation</h1>
        <p class="text-lg mb-8">
          Testing SVG path animations with anime.js
        </p>

        <div class="grid gap-8">
          {/* Simple path */}
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Simple Curve</h2>
            <SVGPathAnimation
              svgPath="M50,150 C150,50 350,50 450,150"
              strokeColor="#3498db"
              strokeWidth={4}
              duration={1500}
            />
          </div>

          {/* Complex path */}
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Complex Shape</h2>
            <SVGPathAnimation
              svgPath="M100,100 L200,100 L200,200 L100,200 Z M150,150 L250,150 L250,250 L150,250 Z"
              strokeColor="#e74c3c"
              strokeWidth={3}
              duration={2000}
              delay={300}
            />
          </div>

          {/* Spiral */}
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Spiral</h2>
            <SVGPathAnimation
              svgPath="M400,200 C380,100 300,100 300,200 C300,300 380,300 400,200 C420,100 500,100 500,200 C500,300 420,300 400,200"
              strokeColor="#2ecc71"
              strokeWidth={2}
              duration={3000}
            />
          </div>

          {/* Mathematical Symbols */}
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Integral Symbol</h2>
            <SVGPathAnimation
              svgPath="M20,180 C40,100 45,80 60,80 C80,80 90,120 90,150 C90,170 80,200 60,200 C45,200 40,180 20,100 L20,180"
              width={220}
              height={300}
              strokeColor="#9b59b6"
              strokeWidth={3}
              duration={2000}
            />
          </div>

          {/* Quadratic curve */}
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Quadratic Function</h2>
            <SVGPathAnimation
              svgPath="M20,180 Q60,80 100,180 Q140,280 180,180"
              width={220}
              height={300}
              strokeColor="#f39c12"
              strokeWidth={3}
              duration={3000}
            />
          </div>
        </div>
      </div>
    </>
  );
}
