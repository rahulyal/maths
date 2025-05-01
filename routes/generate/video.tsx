import { Head } from "$fresh/runtime.ts";
import { VideoGenerator } from "../../islands/VideoGenerator.tsx";

export default function VideoGeneratorPage() {
  return (
    <>
      <Head>
        <title>Video Generator</title>
      </Head>
      <div class="container mx-auto py-8">
        <VideoGenerator />
      </div>
    </>
  );
}
