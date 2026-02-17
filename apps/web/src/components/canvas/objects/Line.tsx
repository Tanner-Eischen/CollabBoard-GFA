"use client";

import { Line } from "react-konva";
import type { CanvasObject } from "@collabboard/shared";

interface LineProps {
  object: CanvasObject;
}

const DEFAULT_STROKE = "#6b7280";
const DEFAULT_LENGTH = 100;

export function LineObject({ object }: LineProps) {
  const w = object.width ?? DEFAULT_LENGTH;
  const data = (object.data ?? {}) as { stroke?: string };
  const stroke = data.stroke ?? DEFAULT_STROKE;

  const points = [0, 0, w, 0];

  return (
    <Line
      x={object.x}
      y={object.y}
      points={points}
      stroke={stroke}
      strokeWidth={2}
      rotation={object.rotation}
      listening={true}
    />
  );
}
