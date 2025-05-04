// islands/SimpleCanvas.tsx
import { useEffect, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";

export default function SimpleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debugLog = useSignal<string[]>([]);
  const testFailed = useSignal(false);

  const addLog = (message: string) => {
    console.log(message);
    debugLog.value = [...debugLog.value, message];
  };

  useEffect(() => {
    if (!canvasRef.current) {
      addLog("❌ Canvas reference not available");
      testFailed.value = true;
      return;
    }

    addLog("✅ Canvas reference created");

    // Try to get 2D context
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) {
      addLog("❌ Failed to get 2D context");
      testFailed.value = true;
      return;
    }

    addLog("✅ Got 2D context");

    // Test basic drawing operations
    try {
      // Clear canvas
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      addLog("✅ Cleared canvas");

      // Draw rectangle
      ctx.fillStyle = "#3498db";
      ctx.fillRect(50, 50, 100, 100);
      addLog("✅ Drew blue rectangle");

      // Draw text
      ctx.fillStyle = "#000000";
      ctx.font = "20px sans-serif";
      ctx.fillText("Canvas is working!", 50, 200);
      addLog("✅ Drew text");

      // Draw line
      ctx.strokeStyle = "#e74c3c";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(200, 50);
      ctx.lineTo(350, 150);
      ctx.stroke();
      addLog("✅ Drew red line");

      // Draw circle
      ctx.fillStyle = "#2ecc71";
      ctx.beginPath();
      ctx.arc(300, 80, 30, 0, Math.PI * 2);
      ctx.fill();
      addLog("✅ Drew green circle");
    } catch (e) {
      addLog(`❌ Error during drawing: ${e}`);
      testFailed.value = true;
    }
  }, []);

  return (
    <div class="grid gap-6">
      <div class="border border-gray-300 rounded-lg overflow-hidden bg-white p-2">
        <h2 class="text-xl font-semibold mb-2">Test Canvas</h2>
        <canvas
          ref={canvasRef}
          width={400}
          height={250}
          class="border border-gray-200"
        >
        </canvas>
      </div>

      <div class="border border-gray-300 rounded-lg overflow-hidden p-4">
        <h2 class="text-xl font-semibold mb-2">Test Log</h2>
        <div
          class={`p-2 rounded ${
            testFailed.value ? "bg-red-100" : "bg-green-100"
          }`}
        >
          <p class="font-bold mb-2">
            {testFailed.value
              ? "❌ Some canvas operations failed"
              : "✅ All canvas operations succeeded"}
          </p>
          <ul class="space-y-1 font-mono text-sm">
            {debugLog.value.map((log, i) => <li key={i}>{log}</li>)}
          </ul>
        </div>

        {testFailed.value && (
          <div class="mt-4 bg-yellow-100 p-3 rounded">
            <h3 class="font-bold">Troubleshooting Tips:</h3>
            <ul class="list-disc list-inside mt-2 space-y-1">
              <li>Make sure your browser supports HTML5 Canvas</li>
              <li>
                Check for browser extensions that might be blocking canvas
              </li>
              <li>Try a different browser to isolate the issue</li>
              <li>Check browser console for additional error messages</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
