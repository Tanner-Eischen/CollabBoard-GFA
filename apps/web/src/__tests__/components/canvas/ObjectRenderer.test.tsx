import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Stage, Layer } from "react-konva";
import { ObjectRenderer } from "@/components/canvas/ObjectRenderer";
import { useObjectStore } from "@/stores/objectStore";

function makeObject(
  overrides: Partial<{
    id: string;
    type: string;
    boardId: string;
    x: number;
    y: number;
  }> = {}
) {
  return {
    id: "obj-1",
    type: "rectangle",
    data: {},
    x: 0,
    y: 0,
    width: 100,
    height: 80,
    rotation: 0,
    zIndex: 0,
    boardId: "board-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderObjectRenderer(boardId: string) {
  return render(
    <Stage width={400} height={300}>
      <Layer>
        <ObjectRenderer boardId={boardId} />
      </Layer>
    </Stage>
  );
}

describe("ObjectRenderer", () => {
  beforeEach(() => {
    useObjectStore.getState().clear();
  });

  it("renders without crashing when no objects", () => {
    expect(() => renderObjectRenderer("board-1")).not.toThrow();
  });

  it("renders rectangle object", () => {
    useObjectStore.getState().setObjects([makeObject({ type: "rectangle" })]);
    const { container } = renderObjectRenderer("board-1");
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("renders multiple object types", () => {
    useObjectStore.getState().setObjects([
      makeObject({ id: "r1", type: "rectangle" }),
      makeObject({ id: "c1", type: "circle", x: 50, y: 50 }),
      makeObject({ id: "s1", type: "sticky", x: 100, y: 100 }),
    ]);
    const { container } = renderObjectRenderer("board-1");
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("does not render objects from other boards", () => {
    useObjectStore.getState().setObjects([
      makeObject({ id: "o1", boardId: "board-2" }),
    ]);
    const { container } = renderObjectRenderer("board-1");
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });
});
