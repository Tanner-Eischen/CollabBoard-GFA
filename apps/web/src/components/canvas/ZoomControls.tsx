"use client";

import { useZoom } from "@/hooks/useZoom";
import { cn } from "@/lib/utils/cn";

interface ZoomControlsProps {
  className?: string;
}

/**
 * Zoom controls (+/-) and percentage indicator.
 */
export function ZoomControls({ className }: ZoomControlsProps) {
  const { zoomPercent, zoomIn, zoomOut, zoomToFit } = useZoom();

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg border border-gray-200 bg-white/90 px-2 py-1 shadow-sm",
        className
      )}
      role="group"
      aria-label="Zoom controls"
    >
      <button
        type="button"
        onClick={() => zoomOut()}
        className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
        aria-label="Zoom out"
      >
        <span className="text-lg font-medium">−</span>
      </button>
      <button
        type="button"
        onClick={() => zoomToFit()}
        className="min-w-[3.5rem] px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
        aria-label="Fit to content"
      >
        {zoomPercent}%
      </button>
      <button
        type="button"
        onClick={() => zoomIn()}
        className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
        aria-label="Zoom in"
      >
        <span className="text-lg font-medium">+</span>
      </button>
    </div>
  );
}
