/**
 * Client-side ID utilities for optimistic updates.
 * Generates unique IDs that can be distinguished from server UUIDs.
 */

const CLIENT_PREFIX = "client:";

/** Generate a client-only ID for optimistic object creation */
export function createClientId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${CLIENT_PREFIX}${crypto.randomUUID()}`;
  }
  return `${CLIENT_PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Check if an ID was generated client-side (for optimistic updates) */
export function isClientId(id: string): boolean {
  return id.startsWith(CLIENT_PREFIX);
}
