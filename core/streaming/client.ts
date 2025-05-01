import { StreamProtocol } from "./protocol.ts";
import { StreamCommand, StreamMessage } from "../../schemas/streaming.ts";

export class StreamClient {
  private static instance: StreamClient | null = null;
  private ws: WebSocket | null = null;
  private protocol: StreamProtocol;
  private clientId: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number | null = null;
  private listeners: Map<string, (command: StreamCommand) => void> = new Map();
  private connected: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {
    this.clientId = crypto.randomUUID();
    this.protocol = new StreamProtocol();
  }

  // Get singleton instance
  public static getInstance(): StreamClient {
    if (!StreamClient.instance) {
      StreamClient.instance = new StreamClient();
    }
    return StreamClient.instance;
  }

  // Check if connected
  isConnected(): boolean {
    return this.connected;
  }

  // Connect to server (returns existing connection if already connected)
  connect(url: string): Promise<void> {
    if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log("Connected to streaming server");
          this.connected = true;
          this.reconnectAttempts = 0;
          this.connectionPromise = null;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = () => {
          console.log("Disconnected from streaming server");
          this.connected = false;
          this.connectionPromise = null;
          this.handleDisconnect(url);
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.connected = false;
          this.connectionPromise = null;
          reject(error);
        };
      } catch (error) {
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  // Send command with connection check
  sendCommand(command: StreamCommand): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = this.protocol.createMessage(command, this.clientId);
      this.ws.send(this.protocol.serializeMessage(message));
    } else {
      console.error("WebSocket not connected - command not sent:", command);
    }
  }

  // Handle incoming message
  private handleMessage(data: string): void {
    const message = this.protocol.deserializeMessage(data);
    if (message) {
      // Notify listeners
      this.listeners.forEach((listener) => {
        listener(message.command);
      });
    }
  }

  // Handle disconnect with auto-reconnect
  private handleDisconnect(url: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

      this.reconnectTimeout = setTimeout(() => {
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
        );
        this.connect(url);
      }, delay);
    }
  }

  // Add command listener
  addListener(id: string, callback: (command: StreamCommand) => void): void {
    this.listeners.set(id, callback);
  }

  // Remove command listener
  removeListener(id: string): void {
    this.listeners.delete(id);
  }

  // Disconnect
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.ws?.close();
    this.ws = null;
    this.connected = false;
    this.connectionPromise = null;
  }

  // Reset singleton (useful for testing)
  static reset(): void {
    if (StreamClient.instance) {
      StreamClient.instance.disconnect();
      StreamClient.instance = null;
    }
  }
}
