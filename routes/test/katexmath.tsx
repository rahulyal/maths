import { Head } from "$fresh/runtime.ts";
import { KatexMath } from "../../islands/KatexMath.tsx";

export default function HandwrittenMathPage() {
  return (
    <>
      <Head>
        <title>Handwritten Math Equations Demo</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&family=Dancing+Script&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div class="container mx-auto py-8">
        <KatexMath />
      </div>
    </>
  );
}
