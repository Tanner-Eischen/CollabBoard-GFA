"use client";

import { useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useObjectStore } from "@/stores/objectStore";
import { useHistoryStore } from "@/stores/historyStore";
import { useCanvasStore } from "@/stores/canvasStore";
import * as objectsApi from "@/lib/api/objects";
import { enqueue } from "@/lib/socket/offlineQueue";
import type { ConnectionStatus } from "./useSocket";
import { OBJECT_TEMPLATES } from "@/components/panels/objectTemplates";

const DRAG_DATA_TYPE = "application/json";

export interface UseDragCreateOptions {
  boardId: string | null;
  status: ConnectionStatus;
  /** Ref to the canvas container (for converting screen coords to stage coords) */
  containerRef: React.RefObject<HTMLElement | null>;
}

export interface UseDragCreateResult {
  /** Pending template type when user clicked a template and is waiting to click canvas */
  pendingTemplateType: string | null;
  /** Handlers for LeftPanel integration */
  handlers: {
    onDragStart: (templateType: string, boardId: string, e: React.DragEvent) => void;
    onDragEnd: () => void;
    onClickTemplate: (templateType: string) => void;
  };
  /** Call when canvas receives drop - pass clientX, clientY from drop event */
  handleDrop: (clientX: number, clientY: number) => void;
  /** Call when canvas receives click (and pendingTemplateType is set) - pass stage x, y */
  handleCanvasClick: (stageX: number, stageY: number) => void;
}

function screenToStage(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  position: { x: number; y: number },
  scale: number
): { x: number; y: number } {
  const screenX = clientX - rect.left;
  const screenY = clientY - rect.top;
  return {
    x: (screenX - position.x) / scale,
    y: (screenY - position.y) / scale,
  };
}

export function useDragCreate({
  boardId,
  status,
  containerRef,
}: UseDragCreateOptions): UseDragCreateResult {
  const { data: session, status: authStatus } = useSession();
  const [pendingTemplateType, setPendingTemplateType] = useState<string | null>(null);
  const dragDataRef = useRef<{ templateType: string; boardId: string } | null>(null);

  const addOptimistic = useObjectStore((s) => s.addOptimistic);
  const confirmOptimistic = useObjectStore((s) => s.confirmOptimistic);
  const rollbackOptimistic = useObjectStore((s) => s.rollbackOptimistic);
  const recordCreate = useHistoryStore((s) => s.recordCreate);
  const position = useCanvasStore((s) => s.position);
  const scale = useCanvasStore((s) => s.scale);

  const createAt = useCallback(
    (stageX: number, stageY: number, templateType: string): void => {
      if (!boardId || authStatus !== "authenticated" || !session?.apiToken) return;

      const template = OBJECT_TEMPLATES.find((t) => t.type === templateType);
      if (!template) return;

      const input = template.getDefaultInput(boardId, stageX, stageY);
      const clientId = addOptimistic(input);

      const token = session.apiToken as string;

      if (status === "connected") {
        objectsApi
          .createObject(token, input)
          .then((serverObject) => {
            confirmOptimistic(clientId, serverObject);
            recordCreate(serverObject);
          })
          .catch(() => {
            rollbackOptimistic(clientId);
          });
      } else {
        enqueue({ type: "object:create", payload: input, clientId });
      }
    },
    [
      boardId,
      authStatus,
      session?.apiToken,
      status,
      addOptimistic,
      confirmOptimistic,
      rollbackOptimistic,
      recordCreate,
    ]
  );

  const handleDrop = useCallback(
    (clientX: number, clientY: number) => {
      const data = dragDataRef.current;
      dragDataRef.current = null;
      if (!data || data.boardId !== boardId) return;

      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const { x, y } = screenToStage(clientX, clientY, rect, position, scale);
      createAt(x, y, data.templateType);
    },
    [boardId, position, scale, containerRef, createAt]
  );

  const handleCanvasClick = useCallback(
    (stageX: number, stageY: number) => {
      if (!pendingTemplateType) return;
      createAt(stageX, stageY, pendingTemplateType);
      setPendingTemplateType(null);
    },
    [pendingTemplateType, createAt]
  );

  const onDragStart = useCallback(
    (templateType: string, bid: string, e: React.DragEvent) => {
      if (!bid) return;
      try {
        const raw = e.dataTransfer.getData(DRAG_DATA_TYPE);
        if (raw) {
          const parsed = JSON.parse(raw) as { templateType?: string; boardId?: string };
          dragDataRef.current = {
            templateType: parsed.templateType ?? templateType,
            boardId: parsed.boardId ?? bid,
          };
        } else {
          dragDataRef.current = { templateType, boardId: bid };
        }
      } catch {
        dragDataRef.current = { templateType, boardId: bid };
      }
    },
    []
  );

  const onDragEnd = useCallback(() => {
    dragDataRef.current = null;
  }, []);

  const onClickTemplate = useCallback((templateType: string) => {
    setPendingTemplateType(templateType);
  }, []);

  return {
    pendingTemplateType,
    handlers: {
      onDragStart,
      onDragEnd,
      onClickTemplate,
    },
    handleDrop,
    handleCanvasClick,
  };
}
