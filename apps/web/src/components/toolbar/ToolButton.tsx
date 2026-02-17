"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { ToolType } from "@/stores/toolStore";

interface ToolButtonProps {
  tool: ToolType;
  label: string;
  shortcut?: string;
  active: boolean;
  onClick: () => void;
  "aria-label"?: string;
}

export function ToolButton({
  tool,
  label,
  shortcut,
  active,
  onClick,
  "aria-label": ariaLabel,
}: ToolButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  const tooltipText = shortcut ? `${label} (${shortcut})` : label;

  return (
    <div className="relative">
      <button
        type="button"
        role="radio"
        aria-checked={active}
        aria-label={ariaLabel ?? tooltipText}
        title={tooltipText}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
          active
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
        )}
      >
        <ToolIcon type={tool} />
      </button>
      {showTooltip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg"
        >
          {tooltipText}
        </div>
      )}
    </div>
  );
}

function ToolIcon({ type }: { type: ToolType }) {
  const size = 18;
  switch (type) {
    case "select":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3l7.07 16.97 2.51-5.39 5.39-2.51L3 3z" />
        </svg>
      );
    case "text":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16v4H4V4zm0 6h10v10H4V10z" />
        </svg>
      );
    case "rectangle":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="1" />
        </svg>
      );
    case "circle":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "line":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 20L20 4" />
        </svg>
      );
    case "connector":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12h16M12 4v16" />
        </svg>
      );
    case "sticky":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h12l4 4v12H4V4z" />
        </svg>
      );
    case "frame":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="2" strokeDasharray="4 2" />
        </svg>
      );
    default:
      return null;
  }
}
