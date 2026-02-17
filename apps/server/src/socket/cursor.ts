import type { Server } from "socket.io";
import type { AuthenticatedSocket } from "./types.js";
import { PresenceService } from "../services/PresenceService.js";
import { roomForBoard } from "./board.js";
import type { CursorMovePayload, CursorUpdatePayload } from "@collabboard/shared";

const THROTTLE_MS = 16; // ~60 FPS per ARCHITECTURE
const lastSent = new Map<string, number>();

function throttleKey(socketId: string, boardId: string): string {
  return `${socketId}:${boardId}`;
}

export function registerCursorHandlers(io: Server): void {
  io.on("connection", (socket: AuthenticatedSocket) => {
    socket.on("cursor:move", (payload: CursorMovePayload) => {
      const { boardId, x, y } = payload ?? {};
      if (
        !boardId ||
        typeof boardId !== "string" ||
        typeof x !== "number" ||
        typeof y !== "number"
      ) {
        return;
      }
      const key = throttleKey(socket.id, boardId);
      const now = Date.now();
      const last = lastSent.get(key) ?? 0;
      if (now - last < THROTTLE_MS) return;
      lastSent.set(key, now);

      const userId = socket.data.userId ?? "anonymous";
      const presence = PresenceService.getUser(boardId, userId);
      if (!presence) return;

      const update: CursorUpdatePayload = {
        userId,
        x,
        y,
        displayName: presence.displayName,
        color: presence.color,
      };
      socket.to(roomForBoard(boardId)).emit("cursor:update", update);
    });
  });
}
