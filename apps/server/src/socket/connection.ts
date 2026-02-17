import type { Server } from "socket.io";
import type { AuthenticatedSocket } from "./types.js";

export function registerConnectionHandlers(io: Server): void {
  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.data.userId ?? "anonymous";
    console.log(`[socket] connect: ${socket.id} (userId=${userId})`);

    socket.on("disconnect", (reason) => {
      console.log(`[socket] disconnect: ${socket.id} reason=${reason}`);
    });
  });
}
