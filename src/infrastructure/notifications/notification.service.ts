import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";

interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

export class NotificationService {
  private static instance: NotificationService | null = null;
  private wss: WebSocketServer | null = null;
  private clients: Map<string, AuthenticatedSocket> = new Map();

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  initialize(server: Server): void {
    if (this.wss) return;
    this.wss = new WebSocketServer({ server, path: "/api/ws" });
    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    if (!this.wss) return;
    this.wss.on("connection", (ws: AuthenticatedSocket, req) => {
      const url = new URL(req.url ?? "", "ws://localhost");
      const userId = url.searchParams.get("userId");

      if (!userId) {
        ws.close(4000, "userId requerido");
        return;
      }

      ws.userId = userId;
      ws.isAlive = true;
      this.clients.set(userId, ws);

      ws.on("pong", () => {
        ws.isAlive = true;
      });

      ws.on("close", () => {
        this.clients.delete(userId);
      });

      ws.on("error", () => {
        this.clients.delete(userId);
      });
    });

    setInterval(() => {
      if (!this.wss) return;
      this.wss.clients.forEach((ws) => {
        const client = ws as AuthenticatedSocket;
        if (!client.isAlive) {
          this.clients.delete(client.userId ?? "");
          return client.terminate();
        }
        client.isAlive = false;
        client.ping();
      });
    }, 30000);
  }

  notifyUser(userId: string, notification: { type: string; message: string; data?: unknown }): void {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  }

  notifyNewComment(postAuthorId: string, comment: { id: string; content: string; postId: string }): void {
    this.notifyUser(postAuthorId, {
      type: "NEW_COMMENT",
      message: "Nuevo comentario en tu publicación",
      data: comment,
    });
  }

  getConnectedClients(): number {
    return this.clients.size;
  }
}
