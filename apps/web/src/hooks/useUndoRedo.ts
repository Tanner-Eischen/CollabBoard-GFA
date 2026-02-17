"use client";

import { useCallback } from "react";
import { useHistoryStore } from "@/stores/historyStore";
import type { UpdateObjectInput } from "@collabboard/shared";

/**
 * Hook for undo/redo and undoable object operations.
 * Use recordUpdate/recordDelete in place of objectStore.updateObject/removeObject
 * for user-initiated actions that should be undoable.
 */
export function useUndoRedo() {
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);
  const recordUpdate = useHistoryStore((s) => s.recordUpdate);
  const recordDelete = useHistoryStore((s) => s.recordDelete);
  const recordDeleteMany = useHistoryStore((s) => s.recordDeleteMany);
  const recordCreate = useHistoryStore((s) => s.recordCreate);

  const canUndo = useHistoryStore((s) => s.undoStack.length > 0);
  const canRedo = useHistoryStore((s) => s.redoStack.length > 0);

  const updateObject = useCallback(
    (id: string, patch: Partial<UpdateObjectInput>) => {
      recordUpdate(id, patch);
    },
    [recordUpdate]
  );

  const removeObject = useCallback(
    (id: string) => {
      recordDelete(id);
    },
    [recordDelete]
  );

  const removeObjects = useCallback(
    (ids: string[]) => {
      recordDeleteMany(ids);
    },
    [recordDeleteMany]
  );

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    updateObject,
    removeObject,
    removeObjects,
    recordCreate,
  };
}
