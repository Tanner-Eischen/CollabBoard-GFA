import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTransform } from "@/hooks/useTransform";
import { useSelectionStore } from "@/stores/selectionStore";
import { useObjectStore } from "@/stores/objectStore";
import { useHistoryStore } from "@/stores/historyStore";

function makeObject(overrides: Partial<{ id: string; x: number; y: number }> = {}) {
  return {
    id: "obj-1",
    type: "rectangle",
    data: {},
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

describe("useTransform", () => {
  beforeEach(() => {
    useSelectionStore.getState().clear();
    useObjectStore.getState().clear();
    useHistoryStore.getState().clear();
    useHistoryStore.getState().setBoardId("board-1");
    useObjectStore.getState().setBoardId("board-1");
  });

  it("nudge moves selected objects", () => {
    useObjectStore.getState().setObjects([makeObject()]);
    useSelectionStore.getState().select("obj-1");

    const { result } = renderHook(() => useTransform());
    act(() => {
      result.current.nudge(5, 10);
    });

    const obj = useObjectStore.getState().objects["obj-1"];
    expect(obj?.x).toBe(15);
    expect(obj?.y).toBe(30);
  });

  it("nudge does nothing when nothing selected", () => {
    useObjectStore.getState().setObjects([makeObject()]);

    const { result } = renderHook(() => useTransform());
    act(() => {
      result.current.nudge(5, 10);
    });

    const obj = useObjectStore.getState().objects["obj-1"];
    expect(obj?.x).toBe(10);
    expect(obj?.y).toBe(20);
  });

  it("nudgeUp moves up", () => {
    useObjectStore.getState().setObjects([makeObject()]);
    useSelectionStore.getState().select("obj-1");

    const { result } = renderHook(() => useTransform());
    act(() => {
      result.current.nudgeUp();
    });

    const obj = useObjectStore.getState().objects["obj-1"];
    expect(obj?.y).toBe(12);
  });

  it("move updates object position", () => {
    useObjectStore.getState().setObjects([makeObject()]);

    const { result } = renderHook(() => useTransform());
    act(() => {
      result.current.move("obj-1", 50, 60);
    });

    const obj = useObjectStore.getState().objects["obj-1"];
    expect(obj?.x).toBe(50);
    expect(obj?.y).toBe(60);
  });
});
