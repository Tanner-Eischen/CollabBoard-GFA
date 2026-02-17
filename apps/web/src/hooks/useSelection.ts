"use client";

import { useCallback } from "react";
import { useSelectionStore } from "@/stores/selectionStore";

/**
 * Hook for selection state and actions.
 * Uses shallow equality for selectedIds to avoid unnecessary re-renders.
 */
export function useSelection() {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const boardId = useSelectionStore((s) => s.boardId);
  const select = useSelectionStore((s) => s.select);
  const selectAdd = useSelectionStore((s) => s.selectAdd);
  const selectRemove = useSelectionStore((s) => s.selectRemove);
  const selectMany = useSelectionStore((s) => s.selectMany);
  const toggle = useSelectionStore((s) => s.toggle);
  const clear = useSelectionStore((s) => s.clear);
  const isSelected = useSelectionStore((s) => s.isSelected);

  const handleSelect = useCallback(
    (id: string, addToSelection: boolean) => {
      if (addToSelection) {
        selectAdd(id);
      } else {
        select(id);
      }
    },
    [select, selectAdd]
  );

  const handleToggle = useCallback(
    (id: string) => {
      toggle(id);
    },
    [toggle]
  );

  return {
    selectedIds,
    boardId,
    select,
    selectAdd,
    selectRemove,
    selectMany,
    toggle,
    clear,
    isSelected,
    handleSelect,
    handleToggle,
  };
}
