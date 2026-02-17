"use client";

import { useRef, useCallback, useState } from "react";
import { useSelectionStore } from "@/stores/selectionStore";
import { useToolStore } from "@/stores/toolStore";
import { ObjectRenderer } from "./ObjectRenderer";
import { TransformerComponent } from "./Transformer";
import { MarqueeRect, getObjectsInRect } from "./SelectionManager";
import { useObjectStore } from "@/stores/objectStore";
import { useHistoryStore } from "@/stores/historyStore";
import type Konva from "konva";

interface CanvasContentProps {
  boardId: string;
  stageRef: React.RefObject<Konva.Stage | null>;
  /** Called when user clicks empty stage area (for object library click-to-create) */
  onStageClick?: (stageX: number, stageY: number) => void;
}

/**
 * Hook: Renders objects, transformer, marquee, and wires selection/transform.
 */
export function useCanvasContent({ boardId, stageRef, onStageClick }: CanvasContentProps) {
  const nodeRefs = useRef<Record<string, Konva.Node | null>>({});
  const [marquee, setMarquee] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null>(null);

  const clear = useSelectionStore((s) => s.clear);
  const selectMany = useSelectionStore((s) => s.selectMany);
  const activeTool = useToolStore((s) => s.activeTool);
  const isSelectMode = activeTool === "select";
  const recordUpdate = useHistoryStore((s) => s.recordUpdate);

  const getPointerInLayer = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    return {
      x: (pos.x - stage.x()) / stage.scaleX(),
      y: (pos.y - stage.y()) / stage.scaleY(),
    };
  }, [stageRef]);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target !== e.target.getStage()) return;
      const pos = getPointerInLayer();
      onStageClick?.(pos?.x ?? 0, pos?.y ?? 0);
      if (isSelectMode) {
        clear();
      }
    },
    [clear, isSelectMode, getPointerInLayer, onStageClick]
  );

  const handleStageMouseDown = useCallback(
    (evt: Konva.KonvaEventObject<MouseEvent>) => {
      if (evt.target !== evt.target.getStage()) return;
      if (!isSelectMode || !evt.evt.shiftKey) return;
      const pos = getPointerInLayer();
      if (pos) setMarquee({ start: pos, end: pos });
    },
    [getPointerInLayer, isSelectMode]
  );

  const handleStageMouseMove = useCallback(() => {
      if (!marquee) return;
      const pos = getPointerInLayer();
      if (pos) setMarquee((m) => (m ? { ...m, end: pos } : null));
    },
    [marquee, getPointerInLayer]
  );

  const handleStageMouseUp = useCallback(
    () => {
      if (!marquee) return;
      const x = Math.min(marquee.start.x, marquee.end.x);
      const y = Math.min(marquee.start.y, marquee.end.y);
      const w = Math.abs(marquee.end.x - marquee.start.x);
      const h = Math.abs(marquee.end.y - marquee.start.y);
      if (w >= 2 && h >= 2) {
        const ids = getObjectsInRect(boardId, { x, y, width: w, height: h });
        selectMany(ids);
      }
      setMarquee(null);
    },
    [marquee, boardId, selectMany]
  );

  const handleTransformEnd = useCallback(
    (id: string, node: Konva.Node) => {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      const obj = useObjectStore.getState().objects[id];
      if (!obj) return;
      const w = obj.width ?? 100;
      const h = obj.height ?? 80;
      recordUpdate(id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, Math.round(w * scaleX)),
        height: Math.max(5, Math.round(h * scaleY)),
        rotation: node.rotation(),
      });
    },
    [recordUpdate]
  );

  return {
    nodeRefs,
    marqueeActive: marquee != null,
    handleStageClick,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
    content: (
      <>
        <ObjectRenderer boardId={boardId} nodeRefs={nodeRefs} isSelectMode={isSelectMode} />
        <TransformerComponent nodeRefs={nodeRefs} onTransformEnd={handleTransformEnd} />
        <MarqueeRect start={marquee?.start ?? null} end={marquee?.end ?? null} />
      </>
    ),
  };
}
