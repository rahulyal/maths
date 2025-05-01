import { StreamServer } from "../../core/streaming/server.ts";

// Get singleton server instance
const server = StreamServer.getInstance();

export const handler = (_req: Request): Response => {
  if (_req.headers.get("upgrade") !== "websocket") {
    return new Response(null, { status: 501 });
  }

  const { socket, response } = Deno.upgradeWebSocket(_req);

  socket.onopen = () => {
    const clientId = crypto.randomUUID();
    server.handleConnection(clientId, socket);
    console.log(`Client connected: ${clientId}`);
  };

  socket.onmessage = (event) => {
    server.handleMessage(event.data);
  };

  socket.onclose = () => {
    server.handleDisconnect(socket);
  };

  return response;
};
