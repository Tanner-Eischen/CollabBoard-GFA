"use client";

import { create } from "zustand";
import { useObjectStore } from "./objectStore";
import type { CanvasObject, UpdateObjectInput } from "@collabboard/shared";
import {
  HISTORY_CAP,
  pushWithCap,
  computeAfterState,
  type HistoryEntry,
} from "@/lib/history";

export interface HistoryState {
  /** Undo stack (most recent last) */
  undoStack: HistoryEntry[];
  /** Redo stack (most recent last) */
  redoStack: HistoryEntry[];
  /** Board ID for current history scope; cleared on board change */
  boardId: string | null;
}

export interface HistoryActions {
  /** Set board ID; clears stacks when board changes */
  setBoardId: (boardId: string | null) => void;
  /** Record create and push to undo stack */
  recordCreate: (object: CanvasObject) => void;
  /** Record update, push to undo stack, apply to object store */
  recordUpdate: (id: string, patch: Partial<UpdateObjectInput>) => void;
  /** Record delete, push to undo stack, remove from object store */
  recordDelete: (id: string) => void;
  /** Record batch delete (multi-select) */
  recordDeleteMany: (ids: string[]) => void;
  /** Undo last action */
  undo: () => void;
  /** Redo last undone action */
  redo: () => void;
  /** Clear both stacks (e.g. on reload/board change) */
  clear: () => void;
}

const initialState: HistoryState = {
  undoStack: [],
  redoStack: [],
  boardId: null,
};

export const useHistoryStore = create<HistoryState & HistoryActions>()((set, get) => ({
  ...initialState,

  setBoardId: (boardId) => {
    const prev = get().boardId;
    if (prev !== boardId) {
      set({ ...initialState, boardId });
    } else {
      set({ boardId });
    }
  },

  recordCreate: (object) => {
    const { boardId } = get();
    if (!boardId || object.boardId !== boardId) return;
    set((s) => ({
      undoStack: pushWithCap(s.undoStack, { type: "create", object }, HISTORY_CAP),
      redoStack: [],
    }));
  },

  recordUpdate: (id, patch) => {
    const { boardId } = get();
    const obj = useObjectStore.getState().objects[id];
    if (!obj || !boardId || obj.boardId !== boardId) return;
    const after = computeAfterState(obj, patch);
    const entry: HistoryEntry = { type: "update", before: { ...obj }, after };
    set((s) => ({
      undoStack: pushWithCap(s.undoStack, entry, HISTORY_CAP),
      redoStack: [],
    }));
    useObjectStore.getState().updateObject(id, patch);
  },

  recordDelete: (id) => {
    get().recordDeleteMany([id]);
  },

  recordDeleteMany: (ids) => {
    const { boardId } = get();
    if (!boardId) return;
    const objects = useObjectStore.getState().objects;
    const toDelete = ids
      .map((id) => objects[id])
      .filter((o): o is CanvasObject => o != null && o.boardId === boardId);
    if (toDelete.length === 0) return;
    const entries: HistoryEntry[] = toDelete.map((obj) => ({ type: "delete" as const, object: { ...obj } }));
    set((s) => {
      let next = s.undoStack;
      for (const entry of entries) {
        next = pushWithCap(next, entry, HISTORY_CAP);
      }
      return { undoStack: next, redoStack: [] };
    });
    for (const obj of toDelete) {
      useObjectStore.getState().removeObject(obj.id);
    }
  },

  undo: () => {
    const { undoStack, boardId } = get();
    if (undoStack.length === 0 || !boardId) return;
    const entry = undoStack[undoStack.length - 1]!;
    set((s) => ({
      undoStack: s.undoStack.slice(0, -1),
      redoStack: pushWithCap(s.redoStack, entry, HISTORY_CAP),
    }));
    applyUndo(entry);
  },

  redo: () => {
    const { redoStack, boardId } = get();
    if (redoStack.length === 0 || !boardId) return;
    const entry = redoStack[redoStack.length - 1]!;
    set((s) => ({
      redoStack: s.redoStack.slice(0, -1),
      undoStack: pushWithCap(s.undoStack, entry, HISTORY_CAP),
    }));
    applyRedo(entry);
  },

  clear: () => set(initialState),
}));

function applyUndo(entry: HistoryEntry): void {
  const store = useObjectStore.getState();
  switch (entry.type) {
    case "create":
      store.removeObject(entry.object.id);
      break;
    case "update":
      store.updateObject(entry.before.id, {
        type: entry.before.type,
        data: entry.before.data,
        x: entry.before.x,
        y: entry.before.y,
        width: entry.before.width,
        height: entry.before.height,
        rotation: entry.before.rotation,
        zIndex: entry.before.zIndex,
      });
      break;
    case "delete":
      store.addObject(entry.object);
      break;
  }
}

function applyRedo(entry: HistoryEntry): void {
  const store = useObjectStore.getState();
  switch (entry.type) {
    case "create":
      store.addObject(entry.object);
      break;
    case "update":
      store.updateObject(entry.after.id, {
        type: entry.after.type,
        data: entry.after.data,
        x: entry.after.x,
        y: entry.after.y,
        width: entry.after.width,
        height: entry.after.height,
        rotation: entry.after.rotation,
        zIndex: entry.after.zIndex,
      });
      break;
    case "delete":
      store.removeObject(entry.object.id);
      break;
  }
}
