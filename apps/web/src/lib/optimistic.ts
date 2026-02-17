/**
 * Optimistic updates and Last-Writer-Wins (LWW) conflict resolution.
 * Server timestamp (updatedAt) is authoritative.
 */

import type { CanvasObject, UpdateObjectInput } from "@collabboard/shared";

/** Compare ISO timestamps: true if a >= b (a is same or newer). */
export function isNewerOrEqual(a: string, b: string): boolean {
  return new Date(a).getTime() >= new Date(b).getTime();
}

/** Server wins when server.updatedAt >= local.updatedAt. */
export function shouldAcceptServer(
  local: CanvasObject | undefined,
  server: CanvasObject
): boolean {
  if (!local) return true;
  return isNewerOrEqual(server.updatedAt, local.updatedAt);
}

/**
 * Reconcile server object with local state using LWW.
 * Returns the object to apply, or null to skip (local is newer - rare, clock skew).
 */
export function reconcileObject(
  local: CanvasObject | undefined,
  server: CanvasObject
): CanvasObject | null {
  if (!shouldAcceptServer(local, server)) return null;
  return server;
}

/**
 * Apply optimistic update to an object: merge partial data and bump updatedAt.
 * Used for immediate feedback before server confirms.
 */
export function applyOptimisticUpdate(
  obj: CanvasObject,
  data: Partial<UpdateObjectInput>
): CanvasObject {
  const now = new Date().toISOString();
  const next: CanvasObject = {
    ...obj,
    ...(data.type !== undefined && { type: data.type }),
    ...(data.x !== undefined && { x: data.x }),
    ...(data.y !== undefined && { y: data.y }),
    ...(data.width !== undefined && { width: data.width }),
    ...(data.height !== undefined && { height: data.height }),
    ...(data.rotation !== undefined && { rotation: data.rotation }),
    ...(data.zIndex !== undefined && { zIndex: data.zIndex }),
    data: data.data !== undefined ? { ...obj.data, ...data.data } : obj.data,
    updatedAt: now,
  };
  return next;
}

/**
 * Check if two objects are effectively equal for display (avoids unnecessary re-renders).
 * Compares key fields that affect rendering.
 */
export function isObjectDisplayEqual(a: CanvasObject, b: CanvasObject): boolean {
  return (
    a.id === b.id &&
    a.type === b.type &&
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width &&
    a.height === b.height &&
    a.rotation === b.rotation &&
    a.zIndex === b.zIndex &&
    JSON.stringify(a.data) === JSON.stringify(b.data)
  );
}
