import type { Socket } from "socket.io";
import { verifySessionToken } from "../lib/auth/session.js";

export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> {
  const token =
    (socket.handshake.auth?.token as string) ??
    (socket.handshake.headers?.authorization?.replace("Bearer ", "") as string);

  if (!token) {
    next(new Error("Authentication error"));
    return;
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    next(new Error("Authentication error"));
    return;
  }

  socket.data.userId = payload.userId;
  next();
}
