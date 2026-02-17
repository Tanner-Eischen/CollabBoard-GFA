"use client";

import { PropertiesPanel } from "./PropertiesPanel";
import { cn } from "@/lib/utils/cn";

export interface RightPanelProps {
  className?: string;
  /** Optional width in pixels; default 280 */
  width?: number;
}

export function RightPanel({ className, width = 280 }: RightPanelProps) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-l border-gray-200 bg-white shadow-sm",
        className
      )}
      style={{ width }}
    >
      <PropertiesPanel />
    </aside>
  );
}
