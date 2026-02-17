"use client";

import { Layer } from "react-konva";
import { GridOverlay } from "./GridOverlay";
import { useCanvasStore } from "@/stores/canvasStore";

interface CanvasLayerProps {
  children?: React.ReactNode;
}

/**
 * Main content layer with grid overlay.
 * Grid visibility is controlled by canvas store.
 */
export function CanvasLayer({ children }: CanvasLayerProps) {
  const gridVisible = useCanvasStore((s) => s.gridVisible);
  const viewportSize = useCanvasStore((s) => s.viewportSize);
  const position = useCanvasStore((s) => s.position);
  const scale = useCanvasStore((s) => s.scale);

  return (
    <Layer>
      {gridVisible && (
        <GridOverlay
          width={viewportSize.width}
          height={viewportSize.height}
          scale={scale}
          position={position}
        />
      )}
      {children}
    </Layer>
  );
}
