"use client";

import { useState, useEffect, useCallback } from "react";
import { ObjectLibrary } from "./ObjectLibrary";
import type { ObjectTemplate } from "./objectTemplates";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEY = "collabboard-left-panel-collapsed";
const DEFAULT_COLLAPSED = false;

function loadCollapsed(): boolean {
  if (typeof window === "undefined") return DEFAULT_COLLAPSED;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "true";
  } catch {
    return DEFAULT_COLLAPSED;
  }
}

function saveCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  } catch {
    // ignore
  }
}

export interface LeftPanelProps {
  boardId: string | null;
  onDragCreate?: {
    onDragStart: (templateType: string, boardId: string, e: React.DragEvent) => void;
    onDragEnd: () => void;
    onClickTemplate: (templateType: string) => void;
  };
  className?: string;
  /** Optional width in pixels; default 240 */
  width?: number;
}

export function LeftPanel({
  boardId,
  onDragCreate,
  className,
  width = 240,
}: LeftPanelProps) {
  const [collapsed, setCollapsedState] = useState(DEFAULT_COLLAPSED);

  useEffect(() => {
    setCollapsedState(loadCollapsed());
  }, []);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    saveCollapsed(value);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  const handleDragStart = useCallback(
    (template: ObjectTemplate, e: React.DragEvent) => {
      if (boardId && onDragCreate) onDragCreate.onDragStart(template.type, boardId, e);
    },
    [boardId, onDragCreate]
  );

  const handleClick = useCallback(
    (template: ObjectTemplate) => {
      onDragCreate?.onClickTemplate(template.type);
    },
    [onDragCreate]
  );

  if (collapsed) {
    return (
      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-gray-200 bg-white shadow-sm",
          className
        )}
        style={{ width: 48 }}
      >
        <button
          type="button"
          aria-label="Expand object library"
          onClick={toggle}
          className="flex h-12 w-full items-center justify-center border-b border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-gray-200 bg-white shadow-sm",
        className
      )}
      style={{ width }}
    >
      <div className="flex h-12 items-center justify-between border-b border-gray-200 px-3">
        <span className="text-sm font-medium text-gray-700">Object Library</span>
        <button
          type="button"
          aria-label="Collapse object library"
          onClick={toggle}
          className="flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <ObjectLibrary
          boardId={boardId}
          onDragStart={onDragCreate ? handleDragStart : undefined}
          onDragEnd={onDragCreate?.onDragEnd}
          onClick={onDragCreate ? handleClick : undefined}
        />
      </div>
    </aside>
  );
}
