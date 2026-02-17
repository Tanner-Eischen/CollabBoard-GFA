"use client";

import { Text } from "react-konva";
import type { CanvasObject } from "@collabboard/shared";

interface TextProps {
  object: CanvasObject;
}

const DEFAULT_TEXT = "Text";
const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 40;
const DEFAULT_FONT_SIZE = 16;

export function TextObject({ object }: TextProps) {
  const w = object.width ?? DEFAULT_WIDTH;
  const h = object.height ?? DEFAULT_HEIGHT;
  const data = (object.data ?? {}) as {
    text?: string;
    fontSize?: number;
    fill?: string;
  };
  const text = data.text ?? DEFAULT_TEXT;
  const fontSize = data.fontSize ?? DEFAULT_FONT_SIZE;
  const fill = data.fill ?? "#1f2937";

  return (
    <Text
      x={object.x}
      y={object.y}
      width={w}
      height={h}
      text={text}
      fontSize={fontSize}
      fill={fill}
      rotation={object.rotation}
      listening={true}
    />
  );
}
