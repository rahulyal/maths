// routes/test/canvas-simple.tsx
import { Head } from "$fresh/runtime.ts";
import SimpleCanvas from "../../islands/simplecanvas.tsx";

export default function SimpleCanvasPage() {
  return (
    <>
      <Head>
        <title>Simple Canvas Test</title>
      </Head>
      <div class="container mx-auto py-8 px-4">
        <h1 class="text-3xl font-bold mb-6">Simple Canvas Test</h1>
        <p class="text-lg mb-8">
          This page tests the most basic canvas functionality without any
          complex systems or dependencies.
        </p>

        <SimpleCanvas />
      </div>
    </>
  );
}
