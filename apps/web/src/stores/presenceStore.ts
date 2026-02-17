import { create } from "zustand";
import type { UserPresence, CursorUpdatePayload } from "@collabboard/shared";

export interface CursorState extends CursorUpdatePayload {
  socketId?: string;
}

interface PresenceState {
  users: UserPresence[];
  cursors: Map<string, CursorState>;
}

interface PresenceActions {
  setUsers: (users: UserPresence[]) => void;
  addUser: (user: UserPresence) => void;
  removeUser: (userId: string) => void;
  setCursor: (userId: string, cursor: CursorState) => void;
  removeCursor: (userId: string) => void;
  clearCursors: () => void;
  reset: () => void;
}

const initialState: PresenceState = {
  users: [],
  cursors: new Map(),
};

export const usePresenceStore = create<PresenceState & PresenceActions>()(
  (set) => ({
    ...initialState,

    setUsers: (users) => set({ users }),

    addUser: (user) =>
      set((state) => {
        if (state.users.some((u) => u.userId === user.userId)) return state;
        return { users: [...state.users, user] };
      }),

    removeUser: (userId) =>
      set((state) => ({
        users: state.users.filter((u) => u.userId !== userId),
        cursors: new Map(
          [...state.cursors.entries()].filter(([k]) => k !== userId)
        ),
      })),

    setCursor: (userId, cursor) =>
      set((state) => {
        const next = new Map(state.cursors);
        next.set(userId, cursor);
        return { cursors: next };
      }),

    removeCursor: (userId) =>
      set((state) => {
        const next = new Map(state.cursors);
        next.delete(userId);
        return { cursors: next };
      }),

    clearCursors: () => set({ cursors: new Map() }),

    reset: () =>
      set({
        users: [],
        cursors: new Map(),
      }),
  })
);
