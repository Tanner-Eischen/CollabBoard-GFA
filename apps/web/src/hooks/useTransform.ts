"use client";

import { useCallback } from "react";
import { useObjectStore } from "@/stores/objectStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useHistoryStore } from "@/stores/historyStore";
import type { UpdateObjectInput } from "@collabboard/shared";

const NUDGE_STEP = 8;

/**
 * Hook for transform operations (move, resize, rotate) on selected objects.
 * Persists changes to object store. Performance-conscious: batches updates.
 */
export function useTransform() {
  const updateObject = useObjectStore((s) => s.updateObject);
  const recordUpdate = useHistoryStore((s) => s.recordUpdate);
  const selectedIds = useSelectionStore((s) => s.selectedIds);

  const nudge = useCallback(
    (dx: number, dy: number) => {
      if (selectedIds.length === 0) return;
      const objs = useObjectStore.getState().objects;
      selectedIds.forEach((id) => {
        const obj = objs[id];
        if (!obj) return;
        recordUpdate(id, { x: obj.x + dx, y: obj.y + dy });
      });
    },
    [selectedIds, recordUpdate]
  );

  const nudgeUp = useCallback(() => nudge(0, -NUDGE_STEP), [nudge]);
  const nudgeDown = useCallback(() => nudge(0, NUDGE_STEP), [nudge]);
  const nudgeLeft = useCallback(() => nudge(-NUDGE_STEP, 0), [nudge]);
  const nudgeRight = useCallback(() => nudge(NUDGE_STEP, 0), [nudge]);

  const move = useCallback(
    (id: string, x: number, y: number) => {
      updateObject(id, { x, y });
    },
    [updateObject]
  );

  const moveSelected = useCallback(
    (dx: number, dy: number) => {
      nudge(dx, dy);
    },
    [nudge]
  );

  const resize = useCallback(
    (id: string, data: Pick<UpdateObjectInput, "width" | "height" | "x" | "y">) => {
      updateObject(id, data);
    },
    [updateObject]
  );

  const rotate = useCallback(
    (id: string, rotation: number) => {
      recordUpdate(id, { rotation });
    },
    [recordUpdate]
  );

  const applyTransform = useCallback(
    (
      id: string,
      data: Partial<{ x: number; y: number; width: number | null; height: number | null; rotation: number }>
    ) => {
      recordUpdate(id, data);
    },
    [recordUpdate]
  );

  return {
    nudge,
    nudgeUp,
    nudgeDown,
    nudgeLeft,
    nudgeRight,
    move,
    moveSelected,
    resize,
    rotate,
    applyTransform,
    NUDGE_STEP,
  };
}
