"use client";

import { useCallback } from "react";
import { Group } from "react-konva";
import type Konva from "konva";
import type { CanvasObject } from "@collabboard/shared";
import { useObjectStore } from "@/stores/objectStore";

interface SelectableObjectProps {
  object: CanvasObject;
  children: React.ReactNode;
  nodeRef: (node: Konva.Node | null) => void;
  onSelect: (id: string, addToSelection: boolean) => void;
  isSelectMode?: boolean;
}

/**
 * Wraps an object in a Group with drag/select/transform handling.
 * Renders children (object content) at (0,0) relative to the Group.
 * The Group position/rotation come from the object.
 */
export function SelectableObject({
  object,
  children,
  nodeRef,
  onSelect,
  isSelectMode = true,
}: SelectableObjectProps) {
  const updateObject = useObjectStore((s) => s.updateObject);

  const handleClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isSelectMode) return;
      e.cancelBubble = true;
      onSelect(object.id, e.evt.shiftKey);
    },
    [object.id, onSelect, isSelectMode]
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      updateObject(object.id, {
        x: node.x(),
        y: node.y(),
      });
    },
    [object.id, updateObject]
  );

  return (
    <Group
      ref={nodeRef}
      x={object.x}
      y={object.y}
      rotation={object.rotation}
      draggable={isSelectMode}
      onClick={handleClick}
      onTap={handleClick}
      onDragEnd={handleDragEnd}
      listening={true}
    >
      {children}
    </Group>
  );
}
