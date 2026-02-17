"use client";

import { useEffect, useCallback } from "react";
import { useSelectionStore } from "@/stores/selectionStore";
import { useTransform } from "./useTransform";

/**
 * Listens for Arrow key presses and nudges selected objects.
 * Undo/redo and Delete handled by useKeyboardShortcuts.
 */
export function useKeyboardNudge() {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const { nudgeUp, nudgeDown, nudgeLeft, nudgeRight } = useTransform();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }
      if (selectedIds.length === 0) return;
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          nudgeUp();
          break;
        case "ArrowDown":
          e.preventDefault();
          nudgeDown();
          break;
        case "ArrowLeft":
          e.preventDefault();
          nudgeLeft();
          break;
        case "ArrowRight":
          e.preventDefault();
          nudgeRight();
          break;
      }
    },
    [selectedIds, nudgeUp, nudgeDown, nudgeLeft, nudgeRight]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
