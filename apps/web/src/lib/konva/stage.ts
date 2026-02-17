export interface Vector2d {
  x: number;
  y: number;
}
import { MIN_ZOOM, MAX_ZOOM } from "@/stores/canvasStore";

const SCALE_BY = 1.1;

export interface ZoomAtPointParams {
  pointer: Vector2d;
  stagePosition: Vector2d;
  currentScale: number;
  direction: 1 | -1;
}

export interface ZoomResult {
  scale: number;
  position: { x: number; y: number };
}

/**
 * Calculate new scale and position for zoom centered on pointer.
 * Used for wheel zoom and zoom controls.
 */
export function zoomAtPoint({
  pointer,
  stagePosition,
  currentScale,
  direction,
}: ZoomAtPointParams): ZoomResult {
  const mousePointTo = {
    x: (pointer.x - stagePosition.x) / currentScale,
    y: (pointer.y - stagePosition.y) / currentScale,
  };

  const rawScale =
    direction > 0 ? currentScale * SCALE_BY : currentScale / SCALE_BY;
  const scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, rawScale));

  const position = {
    x: pointer.x - mousePointTo.x * scale,
    y: pointer.y - mousePointTo.y * scale,
  };

  return { scale, position };
}

/**
 * Scale factor for a single zoom step (e.g. +/- button).
 */
export function zoomStepFactor(direction: 1 | -1): number {
  return direction > 0 ? SCALE_BY : 1 / SCALE_BY;
}

/**
 * Convert scale (e.g. 1) to percentage (e.g. 100).
 */
export function scaleToPercent(scale: number): number {
  return Math.round(scale * 100);
}
