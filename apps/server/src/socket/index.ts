import { createAdapter } from "@socket.io/redis-adapter";
import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { redis } from "../lib/redis.js";
import { socketAuthMiddleware } from "./auth.js";
import { registerConnectionHandlers } from "./connection.js";

const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:3000"].filter(
  (origin): origin is string => Boolean(origin?.trim())
);

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  if (process.env.NODE_ENV !== "test") {
    const pubClient = redis;
    const subClient = redis.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
  }

  io.use(socketAuthMiddleware);
  registerConnectionHandlers(io);

  return io;
}
