import { Head } from "$fresh/runtime.ts";

export default function Home() {
  return (
    <>
      <Head>
        <title>Math Streaming System</title>
      </Head>
      <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Math Streaming System
          </h1>
          <p class="text-xl text-gray-600 mb-8">
            High-performance math explanations with AI
          </p>
          <div class="flex gap-4 justify-center">
            <a
              href="/test/canvas"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Canvas
            </a>
            <a
              href="/test/math"
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Math Rendering
            </a>
            <a
              href="/test/katexmath"
              class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Test Katex Math
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
