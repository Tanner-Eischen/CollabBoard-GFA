"use client";

import { useState } from "react";
import { ToolButton } from "./ToolButton";
import { useToolStore, TOOL_CONFIGS } from "@/stores/toolStore";
import { cn } from "@/lib/utils/cn";

export function Toolbar() {
  const activeTool = useToolStore((s) => s.activeTool);
  const setActiveTool = useToolStore((s) => s.setActiveTool);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg border border-gray-200 bg-white/95 px-2 py-1.5 shadow-sm backdrop-blur",
        collapsed && "w-10 flex-col"
      )}
      role="toolbar"
      aria-label="Drawing tools"
    >
      <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
        {TOOL_CONFIGS.map((config) => (
          <ToolButton
            key={config.type}
            tool={config.type}
            label={config.label}
            shortcut={config.shortcut}
            active={activeTool === config.type}
            onClick={() => setActiveTool(config.type)}
          />
        ))}
      </div>
      <button
        type="button"
        aria-label={collapsed ? "Expand toolbar" : "Collapse toolbar"}
        onClick={() => setCollapsed(!collapsed)}
        className="ml-1 flex h-8 w-8 items-center justify-center rounded border border-transparent text-gray-500 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-700"
      >
        {collapsed ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        )}
      </button>
    </div>
  );
}
