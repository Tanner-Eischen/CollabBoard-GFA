/**
 * Lightweight offline queue for object operations.
 * Enqueue when offline; flush on reconnect.
 */

import type { CreateObjectInput, UpdateObjectInput } from "@collabboard/shared";
import * as objectsApi from "@/lib/api/objects";
import { useObjectStore } from "@/stores/objectStore";
import { useHistoryStore } from "@/stores/historyStore";

export type QueuedOp =
  | { type: "object:create"; payload: CreateObjectInput; clientId: string }
  | { type: "object:update"; id: string; payload: UpdateObjectInput }
  | { type: "object:delete"; id: string };

const queue: QueuedOp[] = [];

export function enqueue(op: QueuedOp): void {
  queue.push(op);
}

export function getQueue(): readonly QueuedOp[] {
  return queue;
}

export function clearQueue(): void {
  queue.length = 0;
}

export function queueLength(): number {
  return queue.length;
}

/**
 * Flush queued operations. Runs in order; stops on first error.
 * Returns number of ops successfully flushed.
 */
export async function flush(token: string): Promise<number> {
  let flushed = 0;
  while (queue.length > 0) {
    const op = queue[0]!;
    try {
      switch (op.type) {
        case "object:create": {
          const created = await objectsApi.createObject(token, op.payload);
          useObjectStore.getState().confirmOptimistic(op.clientId, created);
          useHistoryStore.getState().recordCreate(created);
          break;
        }
        case "object:update":
          await objectsApi.updateObject(token, op.id, op.payload);
          break;
        case "object:delete":
          await objectsApi.deleteObject(token, op.id);
          break;
      }
      queue.shift();
      flushed++;
    } catch {
      break;
    }
  }
  return flushed;
}
