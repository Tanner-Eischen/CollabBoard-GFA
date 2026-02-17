"use client";

import { useRef, useCallback } from "react";
import { Stage } from "react-konva";
import { CanvasLayer } from "./CanvasLayer";
import { CursorOverlay } from "./CursorOverlay";
import { useCanvas } from "@/hooks/useCanvas";
import { zoomAtPoint } from "@/lib/konva/stage";
import { useCanvasContent } from "./CanvasContent";
import type Konva from "konva";

interface CanvasProps {
  children?: React.ReactNode;
  boardId?: string;
  /** Emit cursor position (stage coords) for presence. */
  onPointerMove?: (x: number, y: number) => void;
  /** Called when user clicks empty stage (e.g. for object library click-to-create) */
  onStageClick?: (stageX: number, stageY: number) => void;
}

/**
 * Main Konva stage with pan (drag) and wheel zoom.
 * Keeps store in sync with stage transforms.
 */
export function Canvas({ children, boardId, onPointerMove, onStageClick }: CanvasProps) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const {
    position,
    scale,
    setPosition,
    setScale,
    viewportSize,
  } = useCanvas();

  const {
    content,
    marqueeActive,
    handleStageClick,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
  } = useCanvasContent({
    boardId: boardId ?? "",
    stageRef,
    onStageClick,
  });

  const handleDragMove = useCallback(
    (e: { target: { x(): number; y(): number } }) => {
      setPosition({ x: e.target.x(), y: e.target.y() });
    },
    [setPosition]
  );

  const handleWheel = useCallback(
    (e: {
      evt: { preventDefault(): void; deltaY: number; ctrlKey: boolean };
    }) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const direction: 1 | -1 = e.evt.deltaY > 0 ? 1 : -1;
      const actualDirection = e.evt.ctrlKey ? (-direction as 1 | -1) : direction;

      const result = zoomAtPoint({
        pointer,
        stagePosition: { x: stage.x(), y: stage.y() },
        currentScale: stage.scaleX(),
        direction: actualDirection,
      });

      setScale(result.scale);
      setPosition(result.position);
    },
    [setScale, setPosition]
  );

  return (
    <Stage
      ref={stageRef}
      width={viewportSize.width}
      height={viewportSize.height}
      x={position.x}
      y={position.y}
      scaleX={scale}
      scaleY={scale}
      draggable={!marqueeActive}
      onDragMove={handleDragMove}
      onWheel={handleWheel}
      onClick={handleStageClick}
      onMouseDown={handleStageMouseDown}
      onMouseMove={handleStageMouseMove}
      onMouseUp={handleStageMouseUp}
    >
      <CanvasLayer>
        {boardId ? content : null}
        {children}
      </CanvasLayer>
      {onPointerMove && <CursorOverlay onPointerMove={onPointerMove} />}
    </Stage>
  );
}
