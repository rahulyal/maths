import { StreamCommand, StreamMessage } from "../../schemas/streaming.ts";

export class StreamProtocol {
  private commandQueue: StreamCommand[] = [];
  private currentTime: number = 0;

  constructor() {
    this.commandQueue = [];
  }

  // Add command to queue
  addCommand(command: StreamCommand): void {
    this.commandQueue.push(command);
    this.commandQueue.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Get due commands
  getDueCommands(currentTime: number): StreamCommand[] {
    this.currentTime = currentTime;
    const dueCommands: StreamCommand[] = [];

    while (
      this.commandQueue.length > 0 &&
      this.commandQueue[0].timestamp <= currentTime
    ) {
      dueCommands.push(this.commandQueue.shift()!);
    }

    return dueCommands;
  }

  // Clear all commands
  clearCommands(): void {
    this.commandQueue = [];
  }

  // Serialize message
  serializeMessage(message: StreamMessage): string {
    return JSON.stringify(message);
  }

  // Deserialize message
  deserializeMessage(data: string): StreamMessage | null {
    try {
      const parsed = JSON.parse(data);
      return StreamMessage.parse(parsed);
    } catch (error) {
      console.error("Failed to deserialize message:", error);
      return null;
    }
  }

  // Create message
  createMessage(command: StreamCommand, clientId: string): StreamMessage {
    return {
      id: crypto.randomUUID(),
      command,
      metadata: {
        clientId,
        timestamp: Date.now(),
        version: "1.0",
      },
    };
  }
}
