import { useEffect, useRef, useState } from "preact/hooks";
import { CanvasEngine } from "../core/canvas/engine.ts";
import { StreamClient } from "../core/streaming/client.ts";
import { ScenePlayer } from "../core/streaming/scenePlayer.ts";
import { EquationRenderer } from "../core/math/equation.ts";
import { GraphRenderer } from "../core/math/graph.ts";
import { GridRenderer } from "../core/math/grid.ts";
import { FunctionGraph, GridConfig, MathEquation } from "../schemas/math.ts";

export function VideoGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const scenePlayerRef = useRef<ScenePlayer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new CanvasEngine(canvasRef.current, {
      width: 800,
      height: 600,
      dpi: globalThis.devicePixelRatio,
      backgroundColor: "#ffffff",
    });

    // Get singleton client instance
    const client = StreamClient.getInstance();

    // Connect to WebSocket server
    const wsUrl = `ws://${globalThis.location.host}/api/stream`;
    client.connect(wsUrl)
      .then(() => {
        setConnectionStatus("Connected");
        console.log("WebSocket connected successfully");
      })
      .catch((error) => {
        setConnectionStatus("Connection Failed");
        console.error("Failed to connect to WebSocket:", error);
      });

    // Initialize scene player
    const scenePlayer = new ScenePlayer(client);
    scenePlayerRef.current = scenePlayer;

    // Track rendered objects
    const renderedObjects = new Map<string, any>();

    // Create default grid for background
    const gridConfig: GridConfig = {
      size: 20,
      lineWidth: 0.5,
      color: { r: 200, g: 200, b: 200, a: 1 },
      majorLines: {
        frequency: 5,
        lineWidth: 1,
        color: { r: 150, g: 150, b: 150, a: 1 },
      },
    };

    // Add command listener
    client.addListener("video-generator", (command) => {
      switch (command.type) {
        case "draw":
          if (command.data.objectType === "equation") {
            const equation: MathEquation = {
              latex: command.data.params.latex!,
              position: command.data.params.position!,
              fontSize: command.data.params.fontSize || 24,
              color: command.data.params.color!,
              animationDuration: 2000,
            };
            const renderer = new EquationRenderer(engine, equation);
            renderedObjects.set(command.data.objectId, renderer);
          } else if (command.data.objectType === "graph") {
            const graph: FunctionGraph = {
              expression: command.data.params.expression!,
              domain: command.data.params.domain!,
              range: { min: 0, max: 600 }, // Default range
              color: command.data.params.color!,
              lineWidth: 2,
              style: "handwritten",
            };
            const renderer = new GraphRenderer(engine, graph);
            renderedObjects.set(command.data.objectId, renderer);
          } else if (
            command.data.objectType === "shape" &&
            command.data.objectId === "grid1"
          ) {
            // Create grid renderer
            const gridRenderer = new GridRenderer(engine, gridConfig);
            renderedObjects.set(command.data.objectId, gridRenderer);
          }
          break;

        case "voice":
          setCurrentText(command.data.text);
          setTimeout(() => {
            setCurrentText("");
          }, command.data.duration || 3000);
          break;
      }
    });

    // Animation loop
    let lastTime = 0;
    function animate(time: number) {
      const deltaTime = time - lastTime;
      lastTime = time;

      engine.clear();

      // Render all objects in appropriate order
      const gridObj = renderedObjects.get("grid1");
      if (gridObj) {
        gridObj.render();
      }

      // Render other objects
      renderedObjects.forEach((renderer, id) => {
        if (id !== "grid1") {
          if (renderer.update) {
            renderer.update(deltaTime);
          }
          renderer.render();
        }
      });

      engine.present();
      requestAnimationFrame(animate);
    }

    animate(0);

    // Cleanup - remove listener but keep connection alive for other components
    return () => {
      client.removeListener("video-generator");
      scenePlayerRef.current = null;
    };
  }, []);

  const playScene = () => {
    const client = StreamClient.getInstance();
    if (!client.isConnected()) {
      alert("WebSocket not connected. Please wait and try again.");
      return;
    }

    if (scenePlayerRef.current) {
      const scene = ScenePlayer.createSampleScene();
      scenePlayerRef.current.addScene(scene);
      scenePlayerRef.current.playScene(scene.id);
      setIsPlaying(true);
    }
  };

  const reconnect = () => {
    const client = StreamClient.getInstance();
    const wsUrl = `ws://${globalThis.location.host}/api/stream`;
    setConnectionStatus("Connecting...");
    client.connect(wsUrl)
      .then(() => {
        setConnectionStatus("Connected");
      })
      .catch(() => {
        setConnectionStatus("Connection Failed");
      });
  };

  return (
    <div class="p-4">
      <h2 class="text-xl font-bold mb-4">Math Canvas Animation</h2>
      <div class="flex gap-4 mb-4">
        <button
          onClick={playScene}
          type="button"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Play Math Animation
        </button>
        <button
          onClick={() => {
            setIsPlaying(false);
            if (scenePlayerRef.current) {
              scenePlayerRef.current.stopScene();
            }
          }}
          type="button"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Stop
        </button>
        <button
          onClick={reconnect}
          type="button"
          class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Reconnect
        </button>
        <div
          class={`px-4 py-2 rounded ${
            connectionStatus === "Connected"
              ? "bg-green-100 text-green-800"
              : connectionStatus === "Connection Failed"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {connectionStatus}
        </div>
      </div>

      <div class="border border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <canvas ref={canvasRef} class="w-full h-[600px] bg-white" />
      </div>

      {currentText && (
        <div class="mt-4 p-4 bg-gray-100 rounded-lg">
          <p class="text-lg">{currentText}</p>
        </div>
      )}
    </div>
  );
}
