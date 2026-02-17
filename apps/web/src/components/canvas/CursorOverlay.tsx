"use client";

import { useCallback } from "react";
import { Layer, Circle, Text } from "react-konva";
import type Konva from "konva";
import { usePresenceStore } from "@/stores/presenceStore";
import { useCanvasStore } from "@/stores/canvasStore";

interface CursorOverlayProps {
  /** Emit cursor position (stage coords). Called on pointer move. */
  onPointerMove?: (x: number, y: number) => void;
}

/**
 * Renders remote user cursors and forwards local pointer position for broadcast.
 * Must be inside a Stage. Uses stage position/scale to transform board coords to screen.
 */
export function CursorOverlay({ onPointerMove }: CursorOverlayProps) {
  const cursors = usePresenceStore((s) => s.cursors);
  const { position, scale } = useCanvasStore();

  const handleMouseMove = useCallback(
    (e: { target: { getStage: () => Konva.Stage | null } }) => {
      const stage = e.target.getStage();
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer || !onPointerMove) return;
      const boardX = (pointer.x - stage.x()) / stage.scaleX();
      const boardY = (pointer.y - stage.y()) / stage.scaleY();
      onPointerMove(boardX, boardY);
    },
    [onPointerMove]
  );

  return (
    <Layer
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseMove}
      listening={true}
    >
      {Array.from(cursors.entries()).map(([userId, cursor]) => {
        const screenX = cursor.x * scale + position.x;
        const screenY = cursor.y * scale + position.y;
        return (
          <CursorShape
            key={userId}
            x={screenX}
            y={screenY}
            color={cursor.color}
            displayName={cursor.displayName}
          />
        );
      })}
    </Layer>
  );
}

function CursorShape({
  x,
  y,
  color,
  displayName,
}: {
  x: number;
  y: number;
  color: string;
  displayName: string;
}) {
  return (
    <>
      <Circle x={x} y={y} radius={6} fill={color} stroke="#fff" strokeWidth={2} listening={false} />
      <Text
        x={x + 10}
        y={y - 6}
        text={displayName}
        fontSize={12}
        fill={color}
        fontStyle="bold"
        listening={false}
      />
    </>
  );
}
