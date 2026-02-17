"use client";

import { useCallback } from "react";
import { useProperties } from "@/hooks/useProperties";
import { Input } from "@/components/ui/Input";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { cn } from "@/lib/utils/cn";

function NumberInput({
  value,
  onChange,
  disabled,
  placeholder,
  min,
  max,
  step = 1,
}: {
  value: number | "mixed" | null;
  onChange: (n: number) => void;
  disabled?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      const n = parseFloat(v);
      if (!Number.isNaN(n)) onChange(n);
    },
    [onChange]
  );

  const displayValue = value === "mixed" || value == null ? "" : value;
  const placeHolder = value === "mixed" ? "Mixed" : placeholder;

  return (
    <Input
      type="number"
      value={displayValue}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeHolder}
      min={min}
      max={max}
      step={step}
      className={cn("h-9", value === "mixed" && "placeholder:italic placeholder:text-gray-500")}
    />
  );
}

export function PropertiesPanel() {
  const {
    hasSelection,
    isMulti,
    x,
    y,
    width,
    height,
    rotation,
    color,
    applyX,
    applyY,
    applyWidth,
    applyHeight,
    applyRotation,
    applyColor,
    selectedObjects,
  } = useProperties();

  const hasSize = selectedObjects.some(
    (o) => o.width != null || o.height != null || ["rectangle", "circle", "text", "sticky", "image", "image-placeholder"].includes(o.type)
  );

  const hasColor = selectedObjects.some((o) =>
    ["rectangle", "circle", "text", "sticky", "line", "arrow", "connector"].includes(o.type)
  );

  const handleXChange = useCallback((n: number) => applyX(n), [applyX]);
  const handleYChange = useCallback((n: number) => applyY(n), [applyY]);
  const handleWidthChange = useCallback((n: number) => applyWidth(n), [applyWidth]);
  const handleHeightChange = useCallback((n: number) => applyHeight(n), [applyHeight]);

  if (!hasSelection) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h3 className="text-sm font-medium text-gray-500">Properties</h3>
        <p className="text-sm text-gray-400">Select an object to edit its properties.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-sm font-medium text-gray-700">
        Properties {isMulti && `(${selectedObjects.length} selected)`}
      </h3>

      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Position</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="sr-only">X</label>
              <NumberInput
                value={x}
                onChange={handleXChange}
                placeholder="X"
              />
            </div>
            <div className="flex-1">
              <label className="sr-only">Y</label>
              <NumberInput
                value={y}
                onChange={handleYChange}
                placeholder="Y"
              />
            </div>
          </div>
        </div>

        {hasSize && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Size</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="sr-only">Width</label>
                <NumberInput
                  value={width}
                  onChange={handleWidthChange}
                  placeholder="W"
                  min={1}
                />
              </div>
              <div className="flex-1">
                <label className="sr-only">Height</label>
                <NumberInput
                  value={height}
                  onChange={handleHeightChange}
                  placeholder="H"
                  min={1}
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Rotation</label>
          <NumberInput
            value={rotation}
            onChange={applyRotation}
            placeholder="°"
            min={-360}
            max={360}
            step={5}
          />
        </div>

        {hasColor && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Color</label>
            <ColorPicker
              value={typeof color === "string" && color !== "mixed" ? color : "#3b82f6"}
              onChange={applyColor}
              mixed={color === "mixed"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
