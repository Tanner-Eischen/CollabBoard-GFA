"use client";

import { Rect } from "react-konva";
import { useObjectStore, getObjectsByBoardIdFromMap } from "@/stores/objectStore";

const MARQUEE_STROKE = "#3b82f6";
const MARQUEE_STROKE_WIDTH = 2;
const MARQUEE_FILL = "rgba(59, 130, 246, 0.1)";

/**
 * Hook: get object IDs that intersect the given rect (in stage/board coords).
 */
export function getObjectsInRect(
  boardId: string,
  rect: { x: number; y: number; width: number; height: number }
): string[] {
  const objects = getObjectsByBoardIdFromMap(
    useObjectStore.getState().objects,
    boardId
  );
  const ids: string[] = [];
  for (const obj of objects) {
    const w = obj.width ?? 50;
    const h = obj.height ?? 50;
    const objRight = obj.x + w;
    const objBottom = obj.y + h;
    const rectRight = rect.x + rect.width;
    const rectBottom = rect.y + rect.height;
    if (
      obj.x < rectRight &&
      objRight > rect.x &&
      obj.y < rectBottom &&
      objBottom > rect.y
    ) {
      ids.push(obj.id);
    }
  }
  return ids;
}

/**
 * Marquee rect overlay - rendered when user drags to select.
 */
export function MarqueeRect({
  start,
  end,
}: {
  start: { x: number; y: number } | null;
  end: { x: number; y: number } | null;
}) {
  if (!start || !end) return null;
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const w = Math.abs(end.x - start.x);
  const h = Math.abs(end.y - start.y);
  if (w < 2 || h < 2) return null;
  return (
    <Rect
      x={x}
      y={y}
      width={w}
      height={h}
      stroke={MARQUEE_STROKE}
      strokeWidth={MARQUEE_STROKE_WIDTH}
      fill={MARQUEE_FILL}
      dash={[4, 4]}
      listening={false}
    />
  );
}
