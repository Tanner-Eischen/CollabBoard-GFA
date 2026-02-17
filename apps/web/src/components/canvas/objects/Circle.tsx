"use client";

import { Circle } from "react-konva";
import type { CanvasObject } from "@collabboard/shared";

interface CircleProps {
  object: CanvasObject;
}

const DEFAULT_FILL = "#22c55e";
const DEFAULT_STROKE = "#15803d";
const DEFAULT_RADIUS = 50;

export function CircleObject({ object }: CircleProps) {
  const w = object.width ?? DEFAULT_RADIUS * 2;
  const h = object.height ?? DEFAULT_RADIUS * 2;
  const radius = Math.min(w, h) / 2;
  const data = (object.data ?? {}) as { fill?: string; stroke?: string };
  const fill = data.fill ?? DEFAULT_FILL;
  const stroke = data.stroke ?? DEFAULT_STROKE;

  return (
    <Circle
      x={object.x + radius}
      y={object.y + radius}
      radius={radius}
      fill={fill}
      stroke={stroke}
      strokeWidth={2}
      rotation={object.rotation}
      listening={true}
    />
  );
}
