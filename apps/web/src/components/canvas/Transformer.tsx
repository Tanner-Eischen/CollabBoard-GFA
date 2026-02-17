"use client";

import { useEffect, useRef } from "react";
import { Transformer } from "react-konva";
import type Konva from "konva";
import { useSelectionStore } from "@/stores/selectionStore";

const MIN_SIZE = 5;

interface TransformerProps {
  nodeRefs: React.MutableRefObject<Record<string, Konva.Node | null>>;
  onTransformEnd?: (id: string, node: Konva.Node) => void;
}

/**
 * Konva Transformer that attaches to selected nodes.
 * Caller must ensure nodeRefs are populated by SelectableObject components.
 */
export function TransformerComponent({
  nodeRefs,
  onTransformEnd,
}: TransformerProps) {
  const transformerRef = useRef<Konva.Transformer>(null);
  const selectedIds = useSelectionStore((s) => s.selectedIds);

  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr || selectedIds.length === 0) return;

    const nodes = selectedIds
      .map((id) => nodeRefs.current[id])
      .filter((n): n is Konva.Node => n != null);

    if (nodes.length > 0) {
      tr.nodes(nodes);
      tr.getLayer()?.batchDraw();
    }
  }, [selectedIds, nodeRefs]);

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    if (!onTransformEnd) return;
    const tr = e.target as unknown as Konva.Transformer;
    const nodes = tr.nodes();
    nodes.forEach((node) => {
      const id = selectedIds.find((sid) => nodeRefs.current[sid] === node);
      if (id) onTransformEnd(id, node);
    });
  };

  if (selectedIds.length === 0) return null;

  return (
    <Transformer
      ref={transformerRef}
      boundBoxFunc={(oldBox, newBox) => {
        if (newBox.width < MIN_SIZE || newBox.height < MIN_SIZE) {
          return oldBox;
        }
        return newBox;
      }}
      onTransformEnd={handleTransformEnd}
    />
  );
}
