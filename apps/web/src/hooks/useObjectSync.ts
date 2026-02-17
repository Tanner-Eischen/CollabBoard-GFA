"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useObjectStore, getObjectsByBoardIdFromMap } from "@/stores/objectStore";
import { isDirty, markSynced } from "@/lib/socket/syncState";
import { enqueue } from "@/lib/socket/offlineQueue";
import * as objectsApi from "@/lib/api/objects";
import type { ConnectionStatus } from "./useSocket";
import type { UpdateObjectInput } from "@collabboard/shared";

const DEBOUNCE_MS = 500;

/**
 * Syncs local object changes to server when online; enqueues when offline.
 * Call from board page with boardId and connection status.
 */
export function useObjectSync(
  boardId: string | undefined,
  status: ConnectionStatus
): void {
  const { data: session, status: authStatus } = useSession();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!boardId || authStatus !== "authenticated" || !session?.apiToken) return;

    const token = session.apiToken as string;

    const sync = () => {
      const state = useObjectStore.getState();
      const objects = getObjectsByBoardIdFromMap(state.objects, boardId);

      for (const obj of objects) {
        if (!isDirty(obj)) continue;

        const payload: UpdateObjectInput = {
          type: obj.type,
          data: obj.data,
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
          rotation: obj.rotation,
          zIndex: obj.zIndex,
        };

        if (status === "connected") {
          objectsApi
            .updateObject(token, obj.id, payload)
            .then((updated) => {
              markSynced(updated);
            })
            .catch(() => {});
        } else {
          enqueue({ type: "object:update", id: obj.id, payload });
        }
      }
    };

    const schedule = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        sync();
      }, DEBOUNCE_MS);
    };

    const unsub = useObjectStore.subscribe(schedule);

    schedule();

    return () => {
      unsub();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [boardId, status, session?.apiToken, authStatus]);
}
