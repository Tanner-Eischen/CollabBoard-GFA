import { create } from "zustand";
import type { CanvasObject } from "@collabboard/shared";

/**
 * In-memory clipboard for canvas objects (copy/paste).
 * Stores objects without IDs; paste creates new objects with fresh IDs.
 */
export interface ClipboardState {
  objects: Omit<CanvasObject, "id" | "createdAt" | "updatedAt">[];
}

export interface ClipboardActions {
  set: (objects: Omit<CanvasObject, "id" | "createdAt" | "updatedAt">[]) => void;
  get: () => Omit<CanvasObject, "id" | "createdAt" | "updatedAt">[];
  clear: () => void;
  isEmpty: () => boolean;
}

export const useClipboardStore = create<ClipboardState & ClipboardActions>()((set, get) => ({
  objects: [],

  set: (objects) => set({ objects }),

  get: () => get().objects,

  clear: () => set({ objects: [] }),

  isEmpty: () => get().objects.length === 0,
}));
