import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import type { Server as HttpServer } from "http";
import { redis } from "../lib/redis.js";
import { socketAuthMiddleware } from "./auth.js";
import { registerConnectionHandlers } from "./connection.js";

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
].filter((o): o is string => Boolean(o?.trim()));

export function createSocketServer(httpServer: HttpServer): Server {
  const pubClient = redis;
  const subClient = redis.duplicate();

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
      credentials: true,
    },
    adapter: createAdapter(pubClient, subClient),
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.use(socketAuthMiddleware);
  registerConnectionHandlers(io);

  return io;
}
