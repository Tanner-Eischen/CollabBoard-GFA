/**
 * Web-specific object types. Re-exports shared types with extensions.
 */

import type { CanvasObject, CreateObjectInput, UpdateObjectInput } from "@collabboard/shared";

export type { CanvasObject, CreateObjectInput, UpdateObjectInput };

/** Client-generated ID for optimistic updates (prefixed to distinguish from server IDs) */
export type ClientObjectId = `client:${string}`;

/** Object that may have a client ID (pending creation) or server ID */
export interface ObjectWithId extends Omit<CanvasObject, "id"> {
  id: string | ClientObjectId;
}
