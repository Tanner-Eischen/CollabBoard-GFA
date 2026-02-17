"use client";

import { Line } from "react-konva";

const GRID_SIZE = 20;
const GRID_COLOR = "#e5e7eb";
const GRID_OPACITY = 0.5;

interface GridOverlayProps {
  width: number;
  height: number;
  scale: number;
  position: { x: number; y: number };
}

/**
 * Renders a grid pattern overlay on the canvas.
 * Grid lines are drawn in stage coordinates for infinite scroll.
 */
export function GridOverlay({
  width,
  height,
  scale,
  position,
}: GridOverlayProps) {
  const lines: React.ReactNode[] = [];

  // Visible range in stage coordinates
  const startX = Math.floor(-position.x / scale / GRID_SIZE) * GRID_SIZE;
  const endX =
    Math.ceil((-position.x + width) / scale / GRID_SIZE) * GRID_SIZE;
  const startY = Math.floor(-position.y / scale / GRID_SIZE) * GRID_SIZE;
  const endY =
    Math.ceil((-position.y + height) / scale / GRID_SIZE) * GRID_SIZE;

  for (let x = startX; x <= endX; x += GRID_SIZE) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY - GRID_SIZE, x, endY + GRID_SIZE]}
        stroke={GRID_COLOR}
        strokeWidth={1 / scale}
        listening={false}
        opacity={GRID_OPACITY}
      />
    );
  }

  for (let y = startY; y <= endY; y += GRID_SIZE) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[startX - GRID_SIZE, y, endX + GRID_SIZE, y]}
        stroke={GRID_COLOR}
        strokeWidth={1 / scale}
        listening={false}
        opacity={GRID_OPACITY}
      />
    );
  }

  return <>{lines}</>;
}
