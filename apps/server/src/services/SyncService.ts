import type { Server } from "socket.io";
import type { ObjectRecord } from "../repositories/ObjectRepository.js";
import { roomForBoard } from "../socket/board.js";

const OBJECT_CREATED = "object:created";
const OBJECT_UPDATED = "object:updated";
const OBJECT_DELETED = "object:deleted";

export interface ObjectJson {
  id: string;
  type: string;
  data: Record<string, unknown>;
  x: number;
  y: number;
  width: number | null;
  height: number | null;
  rotation: number;
  zIndex: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

/** Convert ObjectRecord to JSON shape for socket/REST. */
export function toObjectJson(obj: ObjectRecord): ObjectJson {
  return {
    id: obj.id,
    type: obj.type,
    data: (obj.data ?? {}) as Record<string, unknown>,
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
    rotation: obj.rotation,
    zIndex: obj.zIndex,
    boardId: obj.boardId,
    createdAt: obj.createdAt instanceof Date ? obj.createdAt.toISOString() : String(obj.createdAt),
    updatedAt: obj.updatedAt instanceof Date ? obj.updatedAt.toISOString() : String(obj.updatedAt),
  };
}

function timestamp(): string {
  return new Date().toISOString();
}

/** LWW: true if a >= b (a is same or newer). Server timestamp is authoritative. */
export function isNewerOrEqual(a: string, b: string): boolean {
  return new Date(a).getTime() >= new Date(b).getTime();
}

/** Broadcast object created to board room. Fire-and-forget for p95 latency. */
export function broadcastObjectCreated(io: Server, boardId: string, obj: ObjectRecord): void {
  const room = roomForBoard(boardId);
  io.to(room).emit(OBJECT_CREATED, {
    object: toObjectJson(obj),
    boardId,
    timestamp: timestamp(),
  });
}

/** Broadcast object updated to board room. */
export function broadcastObjectUpdated(io: Server, boardId: string, obj: ObjectRecord): void {
  const room = roomForBoard(boardId);
  io.to(room).emit(OBJECT_UPDATED, {
    object: toObjectJson(obj),
    boardId,
    timestamp: timestamp(),
  });
}

/** Broadcast object deleted to board room. */
export function broadcastObjectDeleted(io: Server, boardId: string, id: string): void {
  const room = roomForBoard(boardId);
  io.to(room).emit(OBJECT_DELETED, {
    id,
    boardId,
    timestamp: timestamp(),
  });
}
