import { StreamClient } from "./client.ts";
import { Scene, StreamCommand } from "../../schemas/streaming.ts";

export class ScenePlayer {
  private client: StreamClient;
  private scenes: Map<string, Scene> = new Map();
  private currentScene: Scene | null = null;
  private startTime: number = 0;
  private isPlaying: boolean = false;
  private animationFrame: number | null = null;

  constructor(client: StreamClient) {
    this.client = client;
  }

  // Add scene
  addScene(scene: Scene): void {
    this.scenes.set(scene.id, scene);
  }

  // Play scene
  playScene(sceneId: string): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      console.error(`Scene not found: ${sceneId}`);
      return;
    }

    this.currentScene = scene;
    this.startTime = Date.now();
    this.isPlaying = true;

    // Send scene start command
    this.client.sendCommand({
      type: "scene",
      timestamp: 0,
      data: {
        sceneId: scene.id,
        transition: "fade",
        duration: 500,
      },
    });

    this.update();
  }

  // Update loop
  private update(): void {
    if (!this.isPlaying || !this.currentScene) {
      return;
    }

    const currentTime = Date.now() - this.startTime;

    // Check for due commands
    const commands = this.currentScene.commands.filter(
      (cmd) =>
        cmd.timestamp <= currentTime && cmd.timestamp > (currentTime - 100),
    );

    // Send due commands
    commands.forEach((command) => {
      this.client.sendCommand(command);
    });

    // Check if scene is complete
    if (currentTime >= this.currentScene.duration) {
      this.stopScene();
      return;
    }

    this.animationFrame = requestAnimationFrame(() => this.update());
  }

  // Stop scene
  stopScene(): void {
    this.isPlaying = false;
    this.currentScene = null;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  // Create sample scene
  static createSampleScene(): Scene {
    return {
      id: "sample-1",
      name: "Introduction to Math Concepts",
      duration: 15000, // 15 seconds
      commands: [
        // Initialize grid
        {
          type: "draw",
          timestamp: 100,
          data: {
            objectId: "grid1",
            operation: "create",
            objectType: "shape",
            params: {
              position: { x: 0, y: 0 },
              color: { r: 200, g: 200, b: 200, a: 1 },
              // Grid parameters handled by the renderer based on object type
            },
          },
        },
        // Voice introduction
        {
          type: "voice",
          timestamp: 500,
          data: {
            text: "Welcome to our mathematical visualization system.",
            duration: 3000,
          },
        },
        // Draw first equation
        {
          type: "draw",
          timestamp: 3000,
          data: {
            objectId: "eq1",
            operation: "create",
            objectType: "equation",
            params: {
              latex: "E = mc²",
              position: { x: 200, y: 160 },
              fontSize: 48,
              color: { r: 0, g: 0, b: 0, a: 1 },
            },
          },
        },
        // Voice explaining first equation
        {
          type: "voice",
          timestamp: 3500,
          data: {
            text:
              "Einstein's mass-energy equivalence equation states that energy equals mass times the speed of light squared.",
            duration: 5000,
          },
        },
        // Draw sine graph
        {
          type: "draw",
          timestamp: 8000,
          data: {
            objectId: "graph1",
            operation: "create",
            objectType: "graph",
            params: {
              expression: "sin(x) * 50 + 300",
              position: { x: 0, y: 0 },
              color: { r: 0, g: 100, b: 255, a: 1 },
              domain: { min: 0, max: 10 },
            },
          },
        },
        // Voice explaining the graph
        {
          type: "voice",
          timestamp: 9000,
          data: {
            text:
              "Here we see a sine wave, one of the fundamental waveforms in mathematics and physics.",
            duration: 4000,
          },
        },
        // Pan camera
        {
          type: "camera",
          timestamp: 13000,
          data: {
            position: { x: 200, y: 200 },
            transition: {
              duration: 2000,
              easing: "ease-in-out",
            },
          },
        },
      ],
    };
  }
}
