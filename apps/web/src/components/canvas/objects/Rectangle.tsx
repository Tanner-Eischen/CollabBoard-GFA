"use client";

import { Rect } from "react-konva";
import type { CanvasObject } from "@collabboard/shared";

interface RectangleProps {
  object: CanvasObject;
}

const DEFAULT_FILL = "#3b82f6";
const DEFAULT_STROKE = "#1d4ed8";
const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 80;

export function RectangleObject({ object }: RectangleProps) {
  const w = object.width ?? DEFAULT_WIDTH;
  const h = object.height ?? DEFAULT_HEIGHT;
  const data = (object.data ?? {}) as { fill?: string; stroke?: string };
  const fill = data.fill ?? DEFAULT_FILL;
  const stroke = data.stroke ?? DEFAULT_STROKE;

  return (
    <Rect
      x={object.x}
      y={object.y}
      width={w}
      height={h}
      fill={fill}
      stroke={stroke}
      strokeWidth={2}
      rotation={object.rotation}
      listening={true}
    />
  );
}
