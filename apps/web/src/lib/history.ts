/**
 * Undo/redo history logic for canvas object operations.
 * Per-user local history with configurable cap.
 */

import type { CanvasObject, UpdateObjectInput } from "@collabboard/shared";
import { applyOptimisticUpdate } from "./optimistic";

export const HISTORY_CAP = 50;

export type HistoryEntry =
  | { type: "create"; object: CanvasObject }
  | { type: "update"; before: CanvasObject; after: CanvasObject }
  | { type: "delete"; object: CanvasObject };

/**
 * Push entry to stack with cap. Drops oldest when over cap.
 */
export function pushWithCap<T>(stack: T[], entry: T, cap: number): T[] {
  const next = [...stack, entry];
  if (next.length > cap) {
    return next.slice(-cap);
  }
  return next;
}

/**
 * Compute "after" state for an update entry.
 */
export function computeAfterState(
  before: CanvasObject,
  patch: Partial<UpdateObjectInput>
): CanvasObject {
  return applyOptimisticUpdate(before, patch);
}
