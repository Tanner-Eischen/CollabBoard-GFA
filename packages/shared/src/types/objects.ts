/**
 * Shared object types for CollabBoard canvas.
 * Used by both frontend and backend.
 */

export interface CanvasObject {
  id: string;
  type: string;
  data: Record<string, unknown>;
  x: number;
  y: number;
  width: number | null;
  height: number | null;
  rotation: number;
  zIndex: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateObjectInput {
  boardId: string;
  type: string;
  data?: Record<string, unknown>;
  x: number;
  y: number;
  width?: number | null;
  height?: number | null;
  rotation?: number;
  zIndex?: number;
}

export interface UpdateObjectInput {
  type?: string;
  data?: Record<string, unknown>;
  x?: number;
  y?: number;
  width?: number | null;
  height?: number | null;
  rotation?: number;
  zIndex?: number;
}
