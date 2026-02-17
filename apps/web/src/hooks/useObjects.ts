"use client";

import { useMemo } from "react";
import {
  useObjectStore,
  getObjectsByBoardIdFromMap,
} from "@/stores/objectStore";

/**
 * Hook for object rendering. Returns objects for the current board from the store,
 * sorted by zIndex for correct layering.
 */
export function useObjects(boardId: string | undefined) {
  const objects = useObjectStore((s) => s.objects);
  const storeBoardId = useObjectStore((s) => s.boardId);

  return useMemo(() => {
    const id = boardId ?? storeBoardId ?? undefined;
    if (!id) return [];
    const list = getObjectsByBoardIdFromMap(objects, id);
    return [...list].sort((a, b) => a.zIndex - b.zIndex);
  }, [boardId, storeBoardId, objects]);
}
