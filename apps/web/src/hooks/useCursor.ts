"use client";

import { useCallback, useRef } from "react";
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "@/lib/socket/events";

/**
 * Emits cursor position for presence. Returns stable emitCursor callback.
 */
export function useCursor(boardId: string | undefined, socket: Socket | null) {
  const boardIdRef = useRef(boardId);
  boardIdRef.current = boardId;

  const emitCursor = useCallback((x: number, y: number) => {
    const id = boardIdRef.current;
    if (!id || !socket?.connected) return;
    socket.emit(SOCKET_EVENTS.CURSOR_MOVE, { boardId: id, x, y });
  }, [socket]);

  return { emitCursor };
}
