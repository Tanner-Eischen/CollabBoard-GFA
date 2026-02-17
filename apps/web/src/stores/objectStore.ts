import { create } from "zustand";
import type { CanvasObject, CreateObjectInput, UpdateObjectInput } from "@collabboard/shared";
import { createClientId } from "@/lib/utils/id";
import {
  applyOptimisticUpdate,
  reconcileObject,
  isObjectDisplayEqual,
} from "@/lib/optimistic";

type ObjectId = string;

export interface ObjectState {
  /** Map of object id -> object. Supports both server and client IDs for optimistic updates. */
  objects: Record<ObjectId, CanvasObject>;
  /** Board ID currently loaded (null when none) */
  boardId: string | null;
  /** Pending optimistic IDs -> server IDs for rollback/replace */
  pendingIds: Record<string, string>;
}

export interface ObjectActions {
  setBoardId: (boardId: string | null) => void;
  setObjects: (objects: CanvasObject[]) => void;
  addObject: (obj: CanvasObject) => void;
  updateObject: (id: ObjectId, data: Partial<UpdateObjectInput>) => void;
  removeObject: (id: ObjectId) => void;
  /** Optimistic add: create placeholder with client ID; return client ID for later replace */
  addOptimistic: (input: CreateObjectInput) => string;
  /** Replace client ID with server object after confirm */
  confirmOptimistic: (clientId: string, serverObject: CanvasObject) => void;
  /** Rollback optimistic add on error */
  rollbackOptimistic: (clientId: string) => void;
  /** Reconcile server object with LWW; skips if display-equal to avoid flicker */
  reconcileUpdate: (serverObject: CanvasObject) => void;
  clear: () => void;
}

const initialState: ObjectState = {
  objects: {},
  boardId: null,
  pendingIds: {},
};

export const useObjectStore = create<ObjectState & ObjectActions>()((set) => ({
  ...initialState,

  setBoardId: (boardId) => set({ boardId }),

  setObjects: (objects) =>
    set({
      objects: objects.reduce(
        (acc, obj) => {
          acc[obj.id] = obj;
          return acc;
        },
        {} as Record<ObjectId, CanvasObject>
      ),
    }),

  addObject: (obj) =>
    set((state) => ({
      objects: { ...state.objects, [obj.id]: obj },
    })),

  updateObject: (id, data) =>
    set((state) => {
      const obj = state.objects[id];
      if (!obj) return state;
      const next = applyOptimisticUpdate(obj, data);
      return { objects: { ...state.objects, [id]: next } };
    }),

  removeObject: (id) =>
    set((state) => {
      const next = { ...state.objects };
      delete next[id];
      return { objects: next };
    }),

  addOptimistic: (input) => {
    const clientId = createClientId();
    const placeholder: CanvasObject = {
      id: clientId,
      type: input.type,
      data: input.data ?? {},
      x: input.x,
      y: input.y,
      width: input.width ?? null,
      height: input.height ?? null,
      rotation: input.rotation ?? 0,
      zIndex: input.zIndex ?? 0,
      boardId: input.boardId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      objects: { ...state.objects, [clientId]: placeholder },
    }));
    return clientId;
  },

  confirmOptimistic: (clientId, serverObject) =>
    set((state) => {
      const next = { ...state.objects };
      delete next[clientId];
      next[serverObject.id] = serverObject;
      const nextPending = { ...state.pendingIds };
      delete nextPending[clientId];
      return { objects: next, pendingIds: nextPending };
    }),

  rollbackOptimistic: (clientId) =>
    set((state) => {
      const next = { ...state.objects };
      delete next[clientId];
      const nextPending = { ...state.pendingIds };
      delete nextPending[clientId];
      return { objects: next, pendingIds: nextPending };
    }),

  reconcileUpdate: (serverObject) =>
    set((state) => {
      const reconciled = reconcileObject(state.objects[serverObject.id], serverObject);
      if (!reconciled) return state;
      const local = state.objects[serverObject.id];
      if (local && isObjectDisplayEqual(local, reconciled)) return state;
      return {
        objects: { ...state.objects, [serverObject.id]: reconciled },
      };
    }),

  clear: () => set(initialState),
}));

export function getObjectsByBoardId(state: ObjectState, boardId: string): CanvasObject[] {
  return Object.values(state.objects).filter((o) => o.boardId === boardId);
}

/** Get objects by board from objects map (for hooks that select objects only). */
export function getObjectsByBoardIdFromMap(
  objects: Record<ObjectId, CanvasObject>,
  boardId: string
): CanvasObject[] {
  return Object.values(objects).filter((o) => o.boardId === boardId);
}

export function getObjectById(state: ObjectState, id: ObjectId): CanvasObject | undefined {
  return state.objects[id];
}
