"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ZoomControls } from "@/components/canvas/ZoomControls";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { PresenceIndicator } from "@/components/board/PresenceIndicator";
import { ConnectionStatus } from "@/components/board/ConnectionStatus";
import { LeftPanel } from "@/components/panels/LeftPanel";
import { RightPanel } from "@/components/panels/RightPanel";
import { useCanvasStore } from "@/stores/canvasStore";
import { useObjectStore } from "@/stores/objectStore";
import { useHistoryStore } from "@/stores/historyStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useToolStore } from "@/stores/toolStore";
import { useSocket } from "@/hooks/useSocket";
import { useBoardPresence } from "@/hooks/useBoardPresence";
import { useBoardObjects } from "@/hooks/useBoardObjects";
import { useObjectSync } from "@/hooks/useObjectSync";
import { useOfflineQueueFlush } from "@/hooks/useOfflineQueue";
import { useCursor } from "@/hooks/useCursor";
import { useKeyboardNudge } from "@/hooks/useKeyboardNudge";
import { useDragCreate } from "@/hooks/useDragCreate";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useCallback, useEffect, useRef } from "react";

const Canvas = dynamic(() => import("@/components/canvas/Canvas").then((m) => ({ default: m.Canvas })), {
  ssr: false,
});

export default function BoardPage() {
  const params = useParams();
  const boardId = params?.id as string | undefined;
  const setBoardId = useObjectStore((s) => s.setBoardId);
  const setHistoryBoardId = useHistoryStore((s) => s.setBoardId);
  const setSelectionBoardId = useSelectionStore((s) => s.setBoardId);
  const { socket, status } = useSocket();
  useBoardPresence(boardId, socket);
  useBoardObjects(boardId, socket);
  useObjectSync(boardId, status);
  useOfflineQueueFlush(status);
  const { emitCursor } = useCursor(boardId, socket);
  useKeyboardNudge();
  useKeyboardShortcuts(boardId, status);

  useEffect(() => {
    setBoardId(boardId ?? null);
    setHistoryBoardId(boardId ?? null);
    setSelectionBoardId(boardId ?? null);
    return () => {
      setBoardId(null);
      setHistoryBoardId(null);
      setSelectionBoardId(null);
      useSelectionStore.getState().clear();
    };
  }, [boardId, setBoardId, setHistoryBoardId, setSelectionBoardId]);

  // Clear selection when switching away from select tool
  const activeTool = useToolStore((s) => s.activeTool);
  useEffect(() => {
    if (activeTool !== "select") {
      useSelectionStore.getState().clear();
    }
  }, [activeTool]);
  const setPosition = useCanvasStore((s) => s.setPosition);
  const setScale = useCanvasStore((s) => s.setScale);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const {
    pendingTemplateType,
    handlers: dragCreateHandlers,
    handleDrop,
    handleCanvasClick,
  } = useDragCreate({
    boardId: boardId ?? null,
    status,
    containerRef: canvasContainerRef,
  });

  // Sync zoom/pan from URL params on mount
  const syncFromUrl = useCallback(() => {
    if (typeof window === "undefined") return;
    const search = new URLSearchParams(window.location.search);
    const x = search.get("x");
    const y = search.get("y");
    const zoom = search.get("zoom");
    if (x != null && y != null) {
      const nx = parseFloat(x);
      const ny = parseFloat(y);
      if (!Number.isNaN(nx) && !Number.isNaN(ny)) {
        setPosition({ x: nx, y: ny });
      }
    }
    if (zoom != null) {
      const nz = parseFloat(zoom);
      if (!Number.isNaN(nz) && nz >= 0.1 && nz <= 4) {
        setScale(nz);
      }
    }
  }, [setPosition, setScale]);

  useEffect(() => {
    syncFromUrl();
  }, [syncFromUrl]);

  // Persist zoom/pan to URL (debounced via popstate)
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useCanvasStore.getState();
      const { position, scale } = state;
      const url = new URL(window.location.href);
      url.searchParams.set("x", String(Math.round(position.x)));
      url.searchParams.set("y", String(Math.round(position.y)));
      url.searchParams.set("zoom", String(scale.toFixed(2)));
      if (window.location.search !== url.search) {
        window.history.replaceState(null, "", url.toString());
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleDrop(e.clientX, e.clientY);
    },
    [handleDrop]
  );

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  return (
    <main className="relative flex h-screen w-screen overflow-hidden bg-gray-100">
      <LeftPanel
        boardId={boardId ?? null}
        onDragCreate={dragCreateHandlers}
      />
      <div
        ref={canvasContainerRef}
        className="relative flex-1 overflow-hidden"
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
      >
        <Canvas
          boardId={boardId}
          onPointerMove={emitCursor}
          onStageClick={
            pendingTemplateType
              ? (x: number, y: number) => handleCanvasClick(x, y)
              : undefined
          }
        />
      </div>
      <RightPanel />
      <div className="pointer-events-none absolute bottom-4 right-4 flex flex-col gap-2">
        <div className="pointer-events-auto">
          <ZoomControls />
        </div>
        <div className="pointer-events-auto flex gap-2">
          <GridToggle />
        </div>
      </div>
      <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
        <div className="pointer-events-auto">
          <Toolbar />
        </div>
        {boardId && (
          <span className="text-sm text-gray-500">Board: {boardId}</span>
        )}
        <div className="pointer-events-auto flex flex-col gap-2">
          <ConnectionStatus status={status} />
          <PresenceIndicator />
        </div>
      </div>
    </main>
  );
}

function GridToggle() {
  const gridVisible = useCanvasStore((s) => s.gridVisible);
  const setGridVisible = useCanvasStore((s) => s.setGridVisible);
  return (
    <button
      type="button"
      onClick={() => setGridVisible(!gridVisible)}
      className="rounded-lg border border-gray-200 bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
    >
      Grid: {gridVisible ? "On" : "Off"}
    </button>
  );
}
