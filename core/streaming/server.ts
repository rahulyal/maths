import { StreamProtocol } from "../../core/streaming/protocol.ts";
import { ClientState, StreamMessage } from "../../schemas/streaming.ts";

export class StreamServer {
  private static instance: StreamServer | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private protocol: StreamProtocol;
  private clientStates: Map<string, ClientState> = new Map();

  private constructor() {
    this.protocol = new StreamProtocol();
  }

  // Get singleton instance
  public static getInstance(): StreamServer {
    if (!StreamServer.instance) {
      StreamServer.instance = new StreamServer();
    }
    return StreamServer.instance;
  }

  // Handle new connection
  handleConnection(clientId: string, socket: WebSocket): void {
    this.clients.set(clientId, socket);
    this.clientStates.set(clientId, {
      id: clientId,
      connected: true,
      lastActive: Date.now(),
      permissions: ["read", "write"],
    });

    // Send welcome message
    const welcomeMessage = this.protocol.createMessage(
      {
        type: "scene",
        timestamp: Date.now(),
        data: { sceneId: "welcome", transition: "none", duration: 0 },
      },
      "server",
    );
    socket.send(this.protocol.serializeMessage(welcomeMessage));
  }

  // Handle incoming message
  handleMessage(data: string): void {
    const message = this.protocol.deserializeMessage(data);
    if (message) {
      // Broadcast to all clients except sender
      this.broadcast(data, message.metadata.clientId);
    }
  }

  // Handle client disconnect
  handleDisconnect(socket: WebSocket): void {
    for (const [clientId, clientSocket] of this.clients) {
      if (clientSocket === socket) {
        this.clients.delete(clientId);
        this.clientStates.delete(clientId);
        console.log(`Client disconnected: ${clientId}`);
        break;
      }
    }
  }

  // Broadcast message to all clients
  broadcast(data: string, excludeClientId?: string): void {
    for (const [clientId, socket] of this.clients) {
      if (
        clientId !== excludeClientId && socket.readyState === WebSocket.OPEN
      ) {
        socket.send(data);
      }
    }
  }

  // Send to specific client
  sendToClient(clientId: string, data: string): void {
    const socket = this.clients.get(clientId);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(data);
    }
  }

  // Get connected clients
  getConnectedClients(): ClientState[] {
    return Array.from(this.clientStates.values());
  }

  // Reset singleton (useful for testing)
  static reset(): void {
    if (StreamServer.instance) {
      StreamServer.instance.clients.forEach((socket) => socket.close());
      StreamServer.instance = null;
    }
  }
}
