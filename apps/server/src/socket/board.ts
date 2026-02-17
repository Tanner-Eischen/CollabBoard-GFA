import type { Server } from "socket.io";
import type { AuthenticatedSocket } from "./types.js";
import { PresenceService } from "../services/PresenceService.js";
import * as SyncService from "../services/SyncService.js";
import * as ObjectService from "../services/ObjectService.js";
import type { BoardJoinPayload } from "@collabboard/shared";

const ROOM_PREFIX = "board:";
const OBJECTS_LIST = "objects:list";

export function roomForBoard(boardId: string): string {
  return `${ROOM_PREFIX}${boardId}`;
}

export function registerBoardHandlers(io: Server): void {
  io.on("connection", (socket: AuthenticatedSocket) => {
    const joinedBoards = new Set<string>();

    socket.on(
      "board:join",
      async (payload: BoardJoinPayload, ack?: (err?: Error) => void) => {
        const boardId = payload?.boardId;
        if (!boardId || typeof boardId !== "string") {
          ack?.(new Error("boardId required"));
          return;
        }
        const userId = socket.data.userId ?? "anonymous";
        try {
          const presence = await PresenceService.joinBoard(boardId, userId, {
            displayName: payload.displayName,
            color: payload.color,
          });
          const room = roomForBoard(boardId);
          await socket.join(room);
          joinedBoards.add(boardId);

          socket.to(room).emit("user:joined", { user: presence });
          const users = PresenceService.getUsers(boardId);
          socket.emit("users:list", { users });
          socket.to(room).emit("users:list", { users });

          // Initial object state sync (reconnect path re-syncs here)
          let objectsJson: SyncService.ObjectJson[] = [];
          if (process.env.DATABASE_URL?.trim()) {
            try {
              const objects = await ObjectService.listObjectsByBoardId(userId, boardId);
              objectsJson = objects.map((o) => SyncService.toObjectJson(o));
            } catch {
              // DB unreachable (e.g. test env) - emit empty
            }
          }
          socket.emit(OBJECTS_LIST, {
            objects: objectsJson,
            boardId,
            timestamp: new Date().toISOString(),
          });
          ack?.();
        } catch (err) {
          ack?.(err instanceof Error ? err : new Error("join failed"));
        }
      }
    );

    socket.on("board:leave", (payload: { boardId?: string }) => {
      const boardId = payload?.boardId;
      if (!boardId || typeof boardId !== "string") return;
      const userId = socket.data.userId ?? "anonymous";
      PresenceService.leaveBoard(boardId, userId);
      joinedBoards.delete(boardId);
      socket.leave(roomForBoard(boardId));
      socket.to(roomForBoard(boardId)).emit("user:left", { userId });
    });

    socket.on("disconnect", () => {
      for (const boardId of joinedBoards) {
        const userId = socket.data.userId ?? "anonymous";
        PresenceService.leaveBoard(boardId, userId);
        socket.to(roomForBoard(boardId)).emit("user:left", { userId });
      }
      joinedBoards.clear();
    });
  });
}
