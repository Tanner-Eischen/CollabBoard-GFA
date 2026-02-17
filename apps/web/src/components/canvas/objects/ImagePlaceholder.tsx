"use client";

import { Group, Rect, Text } from "react-konva";
import type { CanvasObject } from "@collabboard/shared";

interface ImagePlaceholderProps {
  object: CanvasObject;
}

const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 80;
const PLACEHOLDER_FILL = "#f3f4f6";
const PLACEHOLDER_STROKE = "#d1d5db";

export function ImagePlaceholderObject({ object }: ImagePlaceholderProps) {
  const w = object.width ?? DEFAULT_WIDTH;
  const h = object.height ?? DEFAULT_HEIGHT;

  return (
    <Group x={object.x} y={object.y} rotation={object.rotation} listening={true}>
      <Rect
        width={w}
        height={h}
        fill={PLACEHOLDER_FILL}
        stroke={PLACEHOLDER_STROKE}
        strokeWidth={2}
        dash={[8, 4]}
      />
      <Text
        x={0}
        y={h / 2 - 8}
        width={w}
        height={16}
        text="Image"
        fontSize={12}
        fill="#9ca3af"
        align="center"
        verticalAlign="middle"
      />
    </Group>
  );
}
