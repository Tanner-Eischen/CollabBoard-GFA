"use client";

import { useCallback, useMemo } from "react";
import { useObjectStore } from "@/stores/objectStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useHistoryStore } from "@/stores/historyStore";
import type { UpdateObjectInput } from "@collabboard/shared";

/**
 * Hook for selection-aware properties editing.
 * Returns aggregated values for single/multi selection and apply functions.
 */
export function useProperties() {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const objects = useObjectStore((s) => s.objects);
  const recordUpdate = useHistoryStore((s) => s.recordUpdate);

  const selectedObjects = useMemo(() => {
    return selectedIds
      .map((id) => objects[id])
      .filter((o): o is NonNullable<typeof o> => o != null);
  }, [selectedIds, objects]);

  const isSingle = selectedObjects.length === 1;
  const isMulti = selectedObjects.length > 1;
  const hasSelection = selectedObjects.length > 0;

  type Mixedable<T> = T | "mixed" | null;

  const x = useMemo((): Mixedable<number> => {
    if (selectedObjects.length === 0) return null;
    const vals = selectedObjects.map((o) => o.x);
    return vals.every((v) => v === vals[0]) ? vals[0] : "mixed";
  }, [selectedObjects]);

  const y = useMemo((): Mixedable<number> => {
    if (selectedObjects.length === 0) return null;
    const vals = selectedObjects.map((o) => o.y);
    return vals.every((v) => v === vals[0]) ? vals[0] : "mixed";
  }, [selectedObjects]);

  const width = useMemo((): Mixedable<number> => {
    if (selectedObjects.length === 0) return null;
    const vals = selectedObjects.map((o) => o.width ?? 0);
    return vals.every((v) => v === vals[0]) ? vals[0] : "mixed";
  }, [selectedObjects]);

  const height = useMemo((): Mixedable<number> => {
    if (selectedObjects.length === 0) return null;
    const vals = selectedObjects.map((o) => o.height ?? 0);
    return vals.every((v) => v === vals[0]) ? vals[0] : "mixed";
  }, [selectedObjects]);

  const rotation = useMemo((): Mixedable<number> => {
    if (selectedObjects.length === 0) return null;
    const vals = selectedObjects.map((o) => o.rotation ?? 0);
    return vals.every((v) => v === vals[0]) ? vals[0] : "mixed";
  }, [selectedObjects]);

  /** Primary fill/stroke/color for shapes that support it */
  const color = useMemo((): Mixedable<string> => {
    if (selectedObjects.length === 0) return null;
    const vals = selectedObjects.map((o) => {
      const d = (o.data ?? {}) as Record<string, unknown>;
      return (d.fill ?? d.stroke ?? d.color ?? "#3b82f6") as string;
    });
    return vals.every((v) => v === vals[0]) ? vals[0] : "mixed";
  }, [selectedObjects]);

  const applyX = useCallback(
    (xVal: number) => {
      selectedIds.forEach((id) => recordUpdate(id, { x: xVal }));
    },
    [selectedIds, recordUpdate]
  );

  const applyY = useCallback(
    (yVal: number) => {
      selectedIds.forEach((id) => recordUpdate(id, { y: yVal }));
    },
    [selectedIds, recordUpdate]
  );

  const applyWidth = useCallback(
    (widthVal: number) => {
      selectedIds.forEach((id) => recordUpdate(id, { width: widthVal }));
    },
    [selectedIds, recordUpdate]
  );

  const applyHeight = useCallback(
    (heightVal: number) => {
      selectedIds.forEach((id) => recordUpdate(id, { height: heightVal }));
    },
    [selectedIds, recordUpdate]
  );

  const applyRotation = useCallback(
    (rotationVal: number) => {
      selectedIds.forEach((id) => recordUpdate(id, { rotation: rotationVal }));
    },
    [selectedIds, recordUpdate]
  );

  const applyColor = useCallback(
    (colorVal: string) => {
      selectedIds.forEach((id) => {
        const obj = objects[id];
        if (!obj) return;
        const d = (obj.data ?? {}) as Record<string, unknown>;
        const hasFill = "fill" in d || ["rectangle", "circle", "text"].includes(obj.type);
        const hasStroke = "stroke" in d || ["rectangle", "circle", "line", "arrow", "connector"].includes(obj.type);
        const hasColor = "color" in d || obj.type === "sticky";
        const nextData: Record<string, unknown> = { ...d };
        if (hasFill) nextData.fill = colorVal;
        if (hasStroke) nextData.stroke = colorVal;
        if (hasColor) nextData.color = colorVal;
        if (!hasFill && !hasStroke && !hasColor) nextData.fill = colorVal;
        recordUpdate(id, { data: nextData } as UpdateObjectInput);
      });
    },
    [selectedIds, objects, recordUpdate]
  );

  const applyTransform = useCallback(
    (data: Partial<UpdateObjectInput>) => {
      selectedIds.forEach((id) => recordUpdate(id, data));
    },
    [selectedIds, recordUpdate]
  );

  return {
    selectedIds,
    selectedObjects,
    hasSelection,
    isSingle,
    isMulti,
    x,
    y,
    width,
    height,
    rotation,
    color,
    applyX,
    applyY,
    applyWidth,
    applyHeight,
    applyRotation,
    applyColor,
    applyTransform,
  };
}
