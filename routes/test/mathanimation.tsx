// // routes/test/math-animation.tsx
// import { Head } from "$fresh/runtime.ts";
// import { MathAnimation } from "../../islands/MathAnimation.tsx";

// export default function MathAnimationTest() {
//   return (
//     <>
//       <Head>
//         <title>Math Animation Test</title>
//       </Head>
//       <div class="container mx-auto py-8 px-4">
//         <h1 class="text-3xl font-bold mb-6">
//           Math Animation with Anime.js 4.0
//         </h1>
//         <p class="text-lg mb-8">
//           This page demonstrates animated math equations using SVG structure
//           extraction and Anime.js 4.0 integration.
//         </p>

//         <div class="grid gap-8">
//           {/* Simple equation */}
//           <div class="p-6 bg-white rounded-lg shadow-md">
//             <h2 class="text-xl font-semibold mb-4">
//               Einstein's Famous Equation
//             </h2>
//             <MathAnimation
//               latex="E = mc^2"
//               duration={1500}
//             />
//           </div>

//           {/* More complex equation */}
//           <div class="p-6 bg-white rounded-lg shadow-md">
//             <h2 class="text-xl font-semibold mb-4">Derivative</h2>
//             <MathAnimation
//               latex="\frac{d}{dx}(x^2) = 2x"
//               duration={2000}
//             />
//           </div>

//           {/* Complex mathematical expression */}
//           <div class="p-6 bg-white rounded-lg shadow-md">
//             <h2 class="text-xl font-semibold mb-4">Integration by Parts</h2>
//             <MathAnimation
//               latex="\int_{a}^{b} u(x)v'(x) \, dx = [u(x)v(x)]_{a}^{b} - \int_{a}^{b} u'(x)v(x) \, dx"
//               height={300}
//               duration={3000}
//             />
//           </div>

//           {/* Quadratic Formula */}
//           <div class="p-6 bg-white rounded-lg shadow-md">
//             <h2 class="text-xl font-semibold mb-4">Quadratic Formula</h2>
//             <MathAnimation
//               latex="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
//               duration={2500}
//             />
//           </div>

//           {/* Euler's Identity */}
//           <div class="p-6 bg-white rounded-lg shadow-md">
//             <h2 class="text-xl font-semibold mb-4">Euler's Identity</h2>
//             <MathAnimation
//               latex="e^{i\pi} + 1 = 0"
//               duration={1800}
//             />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
