"use client";

import { memo, useCallback } from "react";
import { useObjects } from "@/hooks/useObjects";
import { useSelection } from "@/hooks/useSelection";
import { SelectableObject } from "./SelectableObject";
import {
  RectangleObject,
  CircleObject,
  TextObject,
  StickyNoteObject,
  LineObject,
  ArrowObject,
  ImagePlaceholderObject,
} from "./objects";
import type { CanvasObject } from "@collabboard/shared";
import type Konva from "konva";

interface ObjectRendererProps {
  boardId?: string;
  nodeRefs?: React.MutableRefObject<Record<string, Konva.Node | null>>;
  isSelectMode?: boolean;
}

const RENDERERS: Record<
  string,
  (props: { object: CanvasObject }) => React.ReactElement | null
> = {
  rectangle: (p) => <RectangleObject object={p.object} />,
  circle: (p) => <CircleObject object={p.object} />,
  text: (p) => <TextObject object={p.object} />,
  sticky: (p) => <StickyNoteObject object={p.object} />,
  line: (p) => <LineObject object={p.object} />,
  arrow: (p) => <ArrowObject object={p.object} />,
  connector: (p) => <ArrowObject object={p.object} />,
  "image-placeholder": (p) => <ImagePlaceholderObject object={p.object} />,
  image: (p) => <ImagePlaceholderObject object={p.object} />,
};

function ObjectRendererInner({ boardId, nodeRefs, isSelectMode = true }: ObjectRendererProps) {
  const objects = useObjects(boardId);
  const { handleSelect } = useSelection();

  const setNodeRef = useCallback(
    (id: string) => (node: Konva.Node | null) => {
      if (nodeRefs) {
        nodeRefs.current[id] = node;
      }
    },
    [nodeRefs]
  );

  if (!boardId) return null;

  return (
    <>
      {objects.map((obj) => {
        const Renderer = RENDERERS[obj.type];
        if (!Renderer) return null;
        const relativeObject: CanvasObject = {
          ...obj,
          x: 0,
          y: 0,
          rotation: 0,
        };
        return (
          <SelectableObject
            key={obj.id}
            object={obj}
            nodeRef={setNodeRef(obj.id)}
            onSelect={handleSelect}
            isSelectMode={isSelectMode}
          >
            <Renderer object={relativeObject} />
          </SelectableObject>
        );
      })}
    </>
  );
}

export const ObjectRenderer = memo(ObjectRendererInner);
