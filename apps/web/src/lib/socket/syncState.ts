/**
 * Tracks which objects have been synced to server (from socket or our own API).
 * Used to avoid re-syncing when we receive socket events.
 */

import type { CanvasObject } from "@collabboard/shared";

type Snapshot = Pick<CanvasObject, "id" | "x" | "y" | "width" | "height" | "rotation" | "data">;

const lastSynced: Record<string, Snapshot> = {};

export function markSynced(obj: CanvasObject): void {
  lastSynced[obj.id] = {
    id: obj.id,
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
    rotation: obj.rotation,
    data: obj.data,
  };
}

export function markSyncedMany(objects: CanvasObject[]): void {
  for (const obj of objects) {
    markSynced(obj);
  }
}

export function getLastSynced(id: string): Snapshot | undefined {
  return lastSynced[id];
}

export function clearSynced(id: string): void {
  delete lastSynced[id];
}

export function clearAllSynced(): void {
  Object.keys(lastSynced).forEach((k) => delete lastSynced[k]);
}

/** True if obj differs from last synced state. */
export function isDirty(obj: CanvasObject): boolean {
  const s = lastSynced[obj.id];
  if (!s) return true;
  return (
    s.x !== obj.x ||
    s.y !== obj.y ||
    s.width !== obj.width ||
    s.height !== obj.height ||
    s.rotation !== obj.rotation ||
    JSON.stringify(s.data) !== JSON.stringify(obj.data)
  );
}
