"use client";

import { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { isModPressed, matchesShortcut } from "@/lib/utils/shortcuts";
import { useToolStore, TOOL_BY_SHORTCUT } from "@/stores/toolStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useObjectStore, getObjectsByBoardIdFromMap } from "@/stores/objectStore";
import { useHistoryStore } from "@/stores/historyStore";
import { useClipboardStore } from "@/stores/clipboardStore";
import { isClientId } from "@/lib/utils/id";
import * as objectsApi from "@/lib/api/objects";
import type { ConnectionStatus } from "./useSocket";
import type { CanvasObject } from "@collabboard/shared";

const PASTE_OFFSET = 20;

/** Check if focus is in a text input (shortcuts should be disabled) */
function isTextInputFocused(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName?.toUpperCase();
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    (el as HTMLElement).isContentEditable === true
  );
}

/**
 * Centralized keyboard shortcuts for tool switching and object actions.
 * Respects text input focus; uses Ctrl/Cmd abstraction.
 */
export function useKeyboardShortcuts(
  boardId: string | undefined,
  status: ConnectionStatus
) {
  const { data: session, status: authStatus } = useSession();
  const setActiveTool = useToolStore((s) => s.setActiveTool);
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const selectMany = useSelectionStore((s) => s.selectMany);
  const recordDeleteMany = useHistoryStore((s) => s.recordDeleteMany);
  const recordCreate = useHistoryStore((s) => s.recordCreate);
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);
  const addOptimistic = useObjectStore((s) => s.addOptimistic);
  const confirmOptimistic = useObjectStore((s) => s.confirmOptimistic);
  const setClipboard = useClipboardStore((s) => s.set);
  const getClipboard = useClipboardStore((s) => s.get);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isTextInputFocused()) return;

      const key = e.key.toLowerCase();

      // Undo: Ctrl/Cmd+Z
      if (matchesShortcut(e, { key: "z", ctrl: true }) && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      // Redo: Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y
      if (
        (matchesShortcut(e, { key: "z", ctrl: true }) && e.shiftKey) ||
        matchesShortcut(e, { key: "y", ctrl: true })
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Tool switching (single key, no modifier)
      const tool = TOOL_BY_SHORTCUT[key];
      if (tool && !isModPressed(e) && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        setActiveTool(tool);
        return;
      }

      // Select-all: Ctrl/Cmd+A
      if (matchesShortcut(e, { key: "a", ctrl: true })) {
        if (!boardId) return;
        e.preventDefault();
        const objects = getObjectsByBoardIdFromMap(
          useObjectStore.getState().objects,
          boardId
        );
        const ids = objects.map((o) => o.id);
        if (ids.length > 0) selectMany(ids);
        return;
      }

      // Copy: Ctrl/Cmd+C
      if (matchesShortcut(e, { key: "c", ctrl: true })) {
        e.preventDefault();
        if (selectedIds.length === 0) return;
        const objects = useObjectStore.getState().objects;
        const toCopy = selectedIds
          .map((id) => objects[id])
          .filter((o): o is CanvasObject => !!o);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- omit id, createdAt, updatedAt for clipboard
        const serialized = toCopy.map(({ id, createdAt, updatedAt, ...rest }) => rest);
        setClipboard(serialized);
        return;
      }

      // Paste: Ctrl/Cmd+V
      if (matchesShortcut(e, { key: "v", ctrl: true })) {
        e.preventDefault();
        if (!boardId || useClipboardStore.getState().isEmpty()) return;
        if (authStatus !== "authenticated" || !session?.apiToken) return;

        const items = getClipboard();
        const token = session.apiToken as string;
        const clientIds: string[] = [];
        const inputs = items.map((item) => {
          const input = {
            boardId,
            type: item.type,
            data: item.data ?? {},
            x: item.x + PASTE_OFFSET,
            y: item.y + PASTE_OFFSET,
            width: item.width ?? null,
            height: item.height ?? null,
            rotation: item.rotation ?? 0,
            zIndex: item.zIndex ?? 0,
          };
          const cid = addOptimistic(input);
          clientIds.push(cid);
          return { ...input, x: input.x, y: input.y };
        });

        if (status === "connected" && inputs.length > 0) {
          objectsApi
            .createObjectsBatch(token, inputs)
            .then((created) => {
              created.forEach((obj, i) => {
                if (clientIds[i]) {
                  confirmOptimistic(clientIds[i]!, obj);
                  recordCreate(obj);
                }
              });
            })
            .catch(() => {});
        }
        return;
      }

      // Duplicate: Ctrl/Cmd+D
      if (matchesShortcut(e, { key: "d", ctrl: true })) {
        e.preventDefault();
        if (!boardId || selectedIds.length === 0) return;
        if (authStatus !== "authenticated" || !session?.apiToken) return;

        const objects = useObjectStore.getState().objects;
        const toDup = selectedIds
          .map((id) => objects[id])
          .filter((o): o is CanvasObject => !!o);
        const token = session.apiToken as string;
        const clientIds: string[] = [];
        const inputs = toDup.map((obj) => {
          const input = {
            boardId,
            type: obj.type,
            data: obj.data ?? {},
            x: obj.x + PASTE_OFFSET,
            y: obj.y + PASTE_OFFSET,
            width: obj.width ?? null,
            height: obj.height ?? null,
            rotation: obj.rotation ?? 0,
            zIndex: obj.zIndex ?? 0,
          };
          const cid = addOptimistic(input);
          clientIds.push(cid);
          return input;
        });

        if (status === "connected" && inputs.length > 0) {
          objectsApi
            .createObjectsBatch(token, inputs)
            .then((created) => {
              created.forEach((obj, i) => {
                if (clientIds[i]) {
                  confirmOptimistic(clientIds[i]!, obj);
                  recordCreate(obj);
                }
              });
            })
            .catch(() => {});
        }
        return;
      }

      // Delete/Backspace
      if (e.key === "Backspace" || e.key === "Delete") {
        const ids = useSelectionStore.getState().selectedIds;
        if (ids.length === 0) return;
        e.preventDefault();
        recordDeleteMany([...ids]);
        useSelectionStore.getState().clear();
        const token = session?.apiToken as string | undefined;
        if (status === "connected" && authStatus === "authenticated" && token) {
          const serverIds = ids.filter((id) => !isClientId(id));
          if (serverIds.length > 0) {
            objectsApi.deleteObjectsBatch(token, serverIds).catch(() => {});
          }
        }
      }
    },
    [
      boardId,
      status,
      authStatus,
      session?.apiToken,
      setActiveTool,
      selectMany,
      recordDeleteMany,
      recordCreate,
      undo,
      redo,
      addOptimistic,
      confirmOptimistic,
      setClipboard,
      getClipboard,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
