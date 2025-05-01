import { Head } from "$fresh/runtime.ts";
import { MathCanvas } from "../../islands/MathCanvas.tsx";

export default function MathTestPage() {
  return (
    <>
      <Head>
        <title>Math Rendering Test</title>
      </Head>
      <div class="container mx-auto py-8">
        <MathCanvas />
      </div>
    </>
  );
}
