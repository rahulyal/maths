import { Head } from "$fresh/runtime.ts";
import { CanvasTest } from "../../islands/CanvasTest.tsx";

export default function CanvasTestPage() {
  return (
    <>
      <Head>
        <title>Canvas Engine Test</title>
      </Head>
      <div class="container mx-auto py-8">
        <CanvasTest />
      </div>
    </>
  );
}
