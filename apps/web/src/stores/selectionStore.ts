import { create } from "zustand";

export interface SelectionState {
  /** Selected object IDs (order preserved for multi-select) */
  selectedIds: string[];
  /** Board ID for selection scope (null = no board) */
  boardId: string | null;
}

export interface SelectionActions {
  setBoardId: (boardId: string | null) => void;
  select: (id: string) => void;
  selectAdd: (id: string) => void;
  selectRemove: (id: string) => void;
  selectMany: (ids: string[]) => void;
  toggle: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
}

const initialState: SelectionState = {
  selectedIds: [],
  boardId: null,
};

export const useSelectionStore = create<SelectionState & SelectionActions>()((set, get) => ({
  ...initialState,

  setBoardId: (boardId) => set({ boardId }),

  select: (id) => set({ selectedIds: [id] }),

  selectAdd: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds
        : [...state.selectedIds, id],
    })),

  selectRemove: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.filter((s) => s !== id),
    })),

  selectMany: (ids) =>
    set((state) => {
      const seen = new Set(state.selectedIds);
      const added = ids.filter((id) => !seen.has(id));
      added.forEach((id) => seen.add(id));
      return { selectedIds: added.length > 0 ? [...state.selectedIds, ...added] : state.selectedIds };
    }),

  toggle: (id) =>
    set((state) => {
      const idx = state.selectedIds.indexOf(id);
      if (idx >= 0) {
        const next = [...state.selectedIds];
        next.splice(idx, 1);
        return { selectedIds: next };
      }
      return { selectedIds: [...state.selectedIds, id] };
    }),

  clear: () => set({ selectedIds: [] }),

  isSelected: (id) => get().selectedIds.includes(id),
}));
