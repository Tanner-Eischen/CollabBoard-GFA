import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProperties } from "@/hooks/useProperties";
import { useSelectionStore } from "@/stores/selectionStore";
import { useObjectStore } from "@/stores/objectStore";
import { useHistoryStore } from "@/stores/historyStore";

function makeObject(overrides: Partial<{
  id: string;
  type: string;
  x: number;
  y: number;
  width: number | null;
  height: number | null;
  rotation: number;
  data: Record<string, unknown>;
}> = {}) {
  return {
    id: "obj-1",
    type: "rectangle",
    data: { fill: "#3b82f6", stroke: "#1d4ed8" },
    x: 10,
    y: 20,
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

describe("useProperties", () => {
  beforeEach(() => {
    useSelectionStore.getState().clear();
    useObjectStore.getState().clear();
    useHistoryStore.getState().clear();
    useHistoryStore.getState().setBoardId("board-1");
    useObjectStore.getState().setBoardId("board-1");
  });

  it("returns no selection state when nothing selected", () => {
    useObjectStore.getState().setObjects([makeObject()]);

    const { result } = renderHook(() => useProperties());

    expect(result.current.hasSelection).toBe(false);
    expect(result.current.isSingle).toBe(false);
    expect(result.current.isMulti).toBe(false);
    expect(result.current.x).toBe(null);
    expect(result.current.selectedObjects).toHaveLength(0);
  });

  it("returns single selection values", () => {
    useObjectStore.getState().setObjects([makeObject()]);
    useSelectionStore.getState().select("obj-1");

    const { result } = renderHook(() => useProperties());

    expect(result.current.hasSelection).toBe(true);
    expect(result.current.isSingle).toBe(true);
    expect(result.current.x).toBe(10);
    expect(result.current.y).toBe(20);
    expect(result.current.width).toBe(100);
    expect(result.current.height).toBe(80);
    expect(result.current.rotation).toBe(0);
    expect(result.current.color).toBe("#3b82f6");
  });

  it("returns mixed when multi-selection has different values", () => {
    useObjectStore.getState().setObjects([
      makeObject({ id: "a", x: 10, y: 20 }),
      makeObject({ id: "b", x: 30, y: 40 }),
    ]);
    useSelectionStore.getState().selectMany(["a", "b"]);

    const { result } = renderHook(() => useProperties());

    expect(result.current.isMulti).toBe(true);
    expect(result.current.x).toBe("mixed");
    expect(result.current.y).toBe("mixed");
  });

  it("applyX updates all selected objects", () => {
    useObjectStore.getState().setObjects([
      makeObject({ id: "a", x: 10 }),
      makeObject({ id: "b", x: 20 }),
    ]);
    useSelectionStore.getState().selectMany(["a", "b"]);

    const { result } = renderHook(() => useProperties());
    act(() => {
      result.current.applyX(50);
    });

    expect(useObjectStore.getState().objects["a"]?.x).toBe(50);
    expect(useObjectStore.getState().objects["b"]?.x).toBe(50);
  });

  it("applyColor updates fill for rectangle", () => {
    useObjectStore.getState().setObjects([makeObject()]);
    useSelectionStore.getState().select("obj-1");

    const { result } = renderHook(() => useProperties());
    act(() => {
      result.current.applyColor("#ef4444");
    });

    const obj = useObjectStore.getState().objects["obj-1"];
    expect((obj?.data as Record<string, unknown>)?.fill).toBe("#ef4444");
  });
});
