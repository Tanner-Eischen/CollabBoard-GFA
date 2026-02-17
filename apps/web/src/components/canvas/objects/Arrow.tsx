"use client";

import { Arrow } from "react-konva";
import type { CanvasObject } from "@collabboard/shared";

interface ArrowProps {
  object: CanvasObject;
}

const DEFAULT_STROKE = "#6b7280";
const DEFAULT_LENGTH = 100;
const POINTER_LENGTH = 12;
const POINTER_WIDTH = 12;

export function ArrowObject({ object }: ArrowProps) {
  const w = object.width ?? DEFAULT_LENGTH;
  const data = (object.data ?? {}) as { stroke?: string };
  const stroke = data.stroke ?? DEFAULT_STROKE;

  const points = [0, 0, w, 0];

  return (
    <Arrow
      x={object.x}
      y={object.y}
      points={points}
      stroke={stroke}
      fill={stroke}
      strokeWidth={2}
      pointerLength={POINTER_LENGTH}
      pointerWidth={POINTER_WIDTH}
      rotation={object.rotation}
      listening={true}
    />
  );
}
