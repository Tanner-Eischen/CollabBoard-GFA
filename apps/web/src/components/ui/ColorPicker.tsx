"use client";

import { useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ffffff",
  "#6b7280",
  "#1f2937",
  "#000000",
];

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  className?: string;
  /** Show "mixed" placeholder when value is mixed */
  mixed?: boolean;
}

export function ColorPicker({
  value,
  onChange,
  disabled = false,
  className,
  mixed = false,
}: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePresetClick = useCallback(
    (color: string) => {
      if (!disabled) onChange(color);
    },
    [onChange, disabled]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (v && !disabled) onChange(v);
    },
    [onChange, disabled]
  );

  const handleSwatchClick = useCallback(() => {
    if (!disabled && inputRef.current) inputRef.current.click();
  }, [disabled]);

  useEffect(() => {
    if (inputRef.current && value && value !== "mixed") {
      inputRef.current.value = value;
    }
  }, [value]);

  if (mixed) {
    return (
      <div
        className={cn(
          "flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2",
          className
        )}
      >
        <div
          className="h-6 w-6 shrink-0 rounded border border-gray-300"
          style={{
            background:
              "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px",
          }}
        />
        <span className="text-sm text-gray-500">Mixed</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className="sr-only"
        aria-label="Pick color"
      />
      <button
        type="button"
        onClick={handleSwatchClick}
        disabled={disabled}
        className="h-9 w-9 shrink-0 rounded-lg border border-gray-300 shadow-sm transition-colors hover:border-gray-400 disabled:opacity-50"
        style={{ backgroundColor: value }}
        aria-label="Color swatch"
      />
      <div className="flex flex-wrap gap-1">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handlePresetClick(c)}
            disabled={disabled}
            className={cn(
              "h-6 w-6 rounded border transition-transform hover:scale-110 disabled:opacity-50",
              value === c ? "ring-2 ring-blue-500 ring-offset-1" : "border-gray-200"
            )}
            style={{ backgroundColor: c }}
            aria-label={`Select ${c}`}
          />
        ))}
      </div>
    </div>
  );
}
