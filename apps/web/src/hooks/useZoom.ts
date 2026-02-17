"use client";

import { useCallback } from "react";
import { useCanvasStore } from "@/stores/canvasStore";
import { zoomAtPoint, scaleToPercent } from "@/lib/konva/stage";
import type { Vector2d } from "@/lib/konva/stage";

/**
 * Hook for zoom operations. Delegates to store and stage utilities.
 */
export function useZoom() {
  const scale = useCanvasStore((s) => s.scale);
  const position = useCanvasStore((s) => s.position);
  const setScale = useCanvasStore((s) => s.setScale);
  const setPosition = useCanvasStore((s) => s.setPosition);
  const viewportSize = useCanvasStore((s) => s.viewportSize);

  const zoomIn = useCallback(
    (pointer?: Vector2d) => {
      const center = pointer ?? {
        x: viewportSize.width / 2,
        y: viewportSize.height / 2,
      };
      const result = zoomAtPoint({
        pointer: center,
        stagePosition: position,
        currentScale: scale,
        direction: 1,
      });
      setScale(result.scale);
      setPosition(result.position);
    },
    [scale, position, viewportSize, setScale, setPosition]
  );

  const zoomOut = useCallback(
    (pointer?: Vector2d) => {
      const center = pointer ?? {
        x: viewportSize.width / 2,
        y: viewportSize.height / 2,
      };
      const result = zoomAtPoint({
        pointer: center,
        stagePosition: position,
        currentScale: scale,
        direction: -1,
      });
      setScale(result.scale);
      setPosition(result.position);
    },
    [scale, position, viewportSize, setScale, setPosition]
  );

  const zoomToFit = useCallback(() => {
    // Placeholder: fit to content will use object bounds in Task 17.
    // For now, reset to 100% zoom at origin.
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [setScale, setPosition]);

  const zoomPercent = scaleToPercent(scale);

  return {
    scale,
    zoomPercent,
    zoomIn,
    zoomOut,
    zoomToFit,
  };
}
