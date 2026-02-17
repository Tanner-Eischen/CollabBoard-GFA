"use client";

import { useEffect } from "react";
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { useObjectStore } from "@/stores/objectStore";
import type { CanvasObject } from "@collabboard/shared";

/**
 * Subscribes to object sync events for the current board.
 * Call from board page with boardId and socket.
 * - objects:list: full replace (initial sync + reconnect)
 * - object:created, object:updated, object:deleted: incremental updates
 */
export function useBoardObjects(boardId: string | undefined, socket: Socket | null) {
  const setObjects = useObjectStore((s) => s.setObjects);
  const reconcileUpdate = useObjectStore((s) => s.reconcileUpdate);
  const removeObject = useObjectStore((s) => s.removeObject);

  useEffect(() => {
    if (!boardId || !socket) return;

    const onObjectsList = (payload: { objects: CanvasObject[]; boardId: string }) => {
      if (payload.boardId !== boardId) return;
      const objects = payload.objects ?? [];
      setObjects(objects);
    };

    const onObjectCreated = (payload: { object: CanvasObject; boardId: string }) => {
      if (payload.boardId !== boardId || !payload.object) return;
      reconcileUpdate(payload.object);
    };

    const onObjectUpdated = (payload: { object: CanvasObject; boardId: string }) => {
      if (payload.boardId !== boardId || !payload.object) return;
      reconcileUpdate(payload.object);
    };

    const onObjectDeleted = (payload: { id: string; boardId: string }) => {
      if (payload.boardId !== boardId || !payload.id) return;
      removeObject(payload.id);
    };

    socket.on(SOCKET_EVENTS.OBJECTS_LIST, onObjectsList);
    socket.on(SOCKET_EVENTS.OBJECT_CREATED, onObjectCreated);
    socket.on(SOCKET_EVENTS.OBJECT_UPDATED, onObjectUpdated);
    socket.on(SOCKET_EVENTS.OBJECT_DELETED, onObjectDeleted);

    return () => {
      socket.off(SOCKET_EVENTS.OBJECTS_LIST, onObjectsList);
      socket.off(SOCKET_EVENTS.OBJECT_CREATED, onObjectCreated);
      socket.off(SOCKET_EVENTS.OBJECT_UPDATED, onObjectUpdated);
      socket.off(SOCKET_EVENTS.OBJECT_DELETED, onObjectDeleted);
    };
  }, [boardId, socket, setObjects, reconcileUpdate, removeObject]);
}
