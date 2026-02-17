"use client";

import { useCallback, useEffect } from "react";
import { useCanvasStore } from "@/stores/canvasStore";

/**
 * Hook for canvas interactions. Keeps UI and store in sync.
 * Use for stage drag, viewport resize, etc.
 */
export function useCanvas() {
  const position = useCanvasStore((s) => s.position);
  const scale = useCanvasStore((s) => s.scale);
  const gridVisible = useCanvasStore((s) => s.gridVisible);
  const viewportSize = useCanvasStore((s) => s.viewportSize);
  const setPosition = useCanvasStore((s) => s.setPosition);
  const setScale = useCanvasStore((s) => s.setScale);
  const setGridVisible = useCanvasStore((s) => s.setGridVisible);
  const setViewportSize = useCanvasStore((s) => s.setViewportSize);

  const handleResize = useCallback(() => {
    if (typeof window === "undefined") return;
    setViewportSize({ width: window.innerWidth, height: window.innerHeight });
  }, [setViewportSize]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return {
    position,
    scale,
    gridVisible,
    viewportSize,
    setPosition,
    setScale,
    setGridVisible,
  };
}
