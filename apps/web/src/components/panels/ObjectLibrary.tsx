"use client";

import { useCallback } from "react";
import { OBJECT_TEMPLATES, type ObjectTemplate } from "./objectTemplates";
import { cn } from "@/lib/utils/cn";

export interface ObjectLibraryProps {
  boardId: string | null;
  onDragStart?: (template: ObjectTemplate, e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onClick?: (template: ObjectTemplate) => void;
  className?: string;
}

function TemplateIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "rect":
      return (
        <div className="h-8 w-12 rounded border-2 border-blue-500 bg-blue-100" />
      );
    case "circle":
      return (
        <div className="h-10 w-10 rounded-full border-2 border-green-500 bg-green-100" />
      );
    case "text":
      return (
        <div className="flex h-8 w-12 items-center justify-center rounded border border-gray-300 bg-white text-xs text-gray-600">
          Aa
        </div>
      );
    case "sticky":
      return (
        <div className="h-8 w-10 rounded border border-amber-400 bg-amber-50 shadow-sm" />
      );
    case "line":
      return (
        <div className="h-0.5 w-12 bg-gray-500" style={{ marginTop: 16 }} />
      );
    case "arrow":
      return (
        <svg
          width={48}
          height={16}
          viewBox="0 0 48 16"
          className="text-gray-500"
          fill="currentColor"
        >
          <line x1="0" y1="8" x2="36" y2="8" stroke="currentColor" strokeWidth={2} />
          <polygon points="36,0 48,8 36,16" fill="currentColor" />
        </svg>
      );
    case "image":
      return (
        <div className="flex h-8 w-12 items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400">
          img
        </div>
      );
    default:
      return <div className="h-8 w-8 rounded bg-gray-200" />;
  }
}

export function ObjectLibrary({
  boardId,
  onDragStart,
  onDragEnd,
  onClick,
  className,
}: ObjectLibraryProps) {
  const handleDragStart = useCallback(
    (template: ObjectTemplate, e: React.DragEvent) => {
      if (!boardId) return;
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          type: "object-template",
          templateType: template.type,
          boardId,
        })
      );
      e.dataTransfer.effectAllowed = "copy";
      e.dataTransfer.setData("text/plain", template.label);
      onDragStart?.(template, e);
    },
    [boardId, onDragStart]
  );

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <h3 className="text-sm font-medium text-gray-700">Objects</h3>
      <p className="text-xs text-gray-500">
        Drag to canvas or click then click on canvas
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {OBJECT_TEMPLATES.map((template) => (
          <button
            key={template.type}
            type="button"
            draggable={!!boardId}
            onDragStart={(e) => handleDragStart(template, e)}
            onDragEnd={onDragEnd}
            onClick={() => onClick?.(template)}
            disabled={!boardId}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-2 text-center transition-colors",
              "hover:border-gray-300 hover:bg-gray-50",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
              !boardId && "cursor-not-allowed opacity-50"
            )}
          >
            <TemplateIcon icon={template.icon} />
            <span className="text-xs font-medium text-gray-700">
              {template.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
