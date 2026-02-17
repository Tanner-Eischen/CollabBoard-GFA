import { describe, expect, it, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useObjects } from "@/hooks/useObjects";
import { useObjectStore } from "@/stores/objectStore";

function makeObject(overrides: Partial<{
  id: string;
  type: string;
  boardId: string;
  x: number;
  y: number;
  width: number | null;
  height: number | null;
  zIndex: number;
}> = {}) {
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

describe("useObjects", () => {
  beforeEach(() => {
    useObjectStore.getState().clear();
  });

  it("returns empty array when no boardId", () => {
    const { result } = renderHook(() => useObjects(undefined));
    expect(result.current).toEqual([]);
  });

  it("returns objects for given boardId", () => {
    const obj = makeObject({ id: "o1", boardId: "board-1" });
    useObjectStore.getState().setObjects([obj]);

    const { result } = renderHook(() => useObjects("board-1"));
    expect(result.current).toHaveLength(1);
    expect(result.current[0]?.id).toBe("o1");
  });

  it("filters by boardId", () => {
    const o1 = makeObject({ id: "o1", boardId: "board-1" });
    const o2 = makeObject({ id: "o2", boardId: "board-2" });
    useObjectStore.getState().setObjects([o1, o2]);

    const { result } = renderHook(() => useObjects("board-1"));
    expect(result.current).toHaveLength(1);
    expect(result.current[0]?.id).toBe("o1");
  });

  it("sorts by zIndex", () => {
    const o1 = makeObject({ id: "o1", zIndex: 2 });
    const o2 = makeObject({ id: "o2", zIndex: 0 });
    const o3 = makeObject({ id: "o3", zIndex: 1 });
    useObjectStore.getState().setObjects([o1, o2, o3]);

    const { result } = renderHook(() => useObjects("board-1"));
    expect(result.current.map((o) => o.id)).toEqual(["o2", "o3", "o1"]);
  });

  it("uses store boardId when boardId prop is undefined", () => {
    useObjectStore.getState().setBoardId("board-1");
    const obj = makeObject({ boardId: "board-1" });
    useObjectStore.getState().setObjects([obj]);

    const { result } = renderHook(() => useObjects(undefined));
    expect(result.current).toHaveLength(1);
  });
});
