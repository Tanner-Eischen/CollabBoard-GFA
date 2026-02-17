"use client";

import { Group, Rect, Text } from "react-konva";
import type { CanvasObject } from "@collabboard/shared";

interface StickyNoteProps {
  object: CanvasObject;
}

const DEFAULT_WIDTH = 160;
const DEFAULT_HEIGHT = 120;
const DEFAULT_COLOR = "#fef08a";
const DEFAULT_TEXT = "Note";
const PADDING = 8;

export function StickyNoteObject({ object }: StickyNoteProps) {
  const w = object.width ?? DEFAULT_WIDTH;
  const h = object.height ?? DEFAULT_HEIGHT;
  const data = (object.data ?? {}) as { text?: string; color?: string };
  const text = data.text ?? DEFAULT_TEXT;
  const color = data.color ?? DEFAULT_COLOR;

  return (
    <Group x={object.x} y={object.y} rotation={object.rotation} listening={true}>
      <Rect
        width={w}
        height={h}
        fill={color}
        stroke="#eab308"
        strokeWidth={1}
        cornerRadius={4}
        shadowColor="black"
        shadowBlur={4}
        shadowOffset={{ x: 2, y: 2 }}
        shadowOpacity={0.2}
      />
      <Text
        x={PADDING}
        y={PADDING}
        width={w - PADDING * 2}
        height={h - PADDING * 2}
        text={text}
        fontSize={14}
        fill="#1f2937"
        wrap="word"
      />
    </Group>
  );
}
