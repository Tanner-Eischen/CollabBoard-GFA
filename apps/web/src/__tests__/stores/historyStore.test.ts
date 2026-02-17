import { describe, expect, it, beforeEach } from "vitest";
import { useHistoryStore } from "@/stores/historyStore";
import { useObjectStore } from "@/stores/objectStore";

const makeObject = (overrides: Partial<{ id: string; x: number; y: number; boardId: string }> = {}) => ({
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
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

describe("historyStore", () => {
  beforeEach(() => {
    useHistoryStore.getState().clear();
    useObjectStore.getState().clear();
    useHistoryStore.getState().setBoardId("board-1");
    useObjectStore.getState().setBoardId("board-1");
  });

  it("records create and undo removes object", () => {
    const obj = makeObject({ id: "created-1" });
    useObjectStore.getState().addObject(obj);
    useHistoryStore.getState().recordCreate(obj);

    expect(useHistoryStore.getState().undoStack).toHaveLength(1);
    useHistoryStore.getState().undo();

    expect(useObjectStore.getState().objects["created-1"]).toBeUndefined();
  });

  it("records update and undo restores before state", () => {
    const obj = makeObject({ id: "obj-1", x: 10, y: 20 });
    useObjectStore.getState().addObject(obj);
    useHistoryStore.getState().recordUpdate("obj-1", { x: 50, y: 60 });

    expect(useObjectStore.getState().objects["obj-1"]?.x).toBe(50);
    useHistoryStore.getState().undo();
    expect(useObjectStore.getState().objects["obj-1"]?.x).toBe(10);
    expect(useObjectStore.getState().objects["obj-1"]?.y).toBe(20);
  });

  it("records delete and undo restores object", () => {
    const obj = makeObject({ id: "obj-1" });
    useObjectStore.getState().addObject(obj);
    useHistoryStore.getState().recordDelete("obj-1");

    expect(useObjectStore.getState().objects["obj-1"]).toBeUndefined();
    useHistoryStore.getState().undo();
    expect(useObjectStore.getState().objects["obj-1"]).toBeDefined();
    expect(useObjectStore.getState().objects["obj-1"]?.id).toBe("obj-1");
  });

  it("redo re-applies undone action", () => {
    const obj = makeObject({ id: "obj-1", x: 10 });
    useObjectStore.getState().addObject(obj);
    useHistoryStore.getState().recordUpdate("obj-1", { x: 50 });
    useHistoryStore.getState().undo();
    expect(useObjectStore.getState().objects["obj-1"]?.x).toBe(10);

    useHistoryStore.getState().redo();
    expect(useObjectStore.getState().objects["obj-1"]?.x).toBe(50);
  });

  it("clears redo stack when new action is recorded", () => {
    const obj = makeObject({ id: "obj-1" });
    useObjectStore.getState().addObject(obj);
    useHistoryStore.getState().recordUpdate("obj-1", { x: 10 });
    useHistoryStore.getState().undo();
    expect(useHistoryStore.getState().redoStack).toHaveLength(1);

    useHistoryStore.getState().recordUpdate("obj-1", { x: 20 });
    expect(useHistoryStore.getState().redoStack).toHaveLength(0);
  });

  it("setBoardId clears stacks when board changes", () => {
    const obj = makeObject();
    useObjectStore.getState().addObject(obj);
    useHistoryStore.getState().recordCreate(obj);
    expect(useHistoryStore.getState().undoStack).toHaveLength(1);

    useHistoryStore.getState().setBoardId("board-2");
    expect(useHistoryStore.getState().undoStack).toHaveLength(0);
    expect(useHistoryStore.getState().redoStack).toHaveLength(0);
  });

  it("recordUpdate applies change to object store", () => {
    const obj = makeObject({ id: "obj-1", x: 0 });
    useObjectStore.getState().addObject(obj);
    useHistoryStore.getState().recordUpdate("obj-1", { x: 100 });

    expect(useObjectStore.getState().objects["obj-1"]?.x).toBe(100);
  });

  it("recordDeleteMany removes multiple objects", () => {
    const obj1 = makeObject({ id: "obj-1" });
    const obj2 = makeObject({ id: "obj-2" });
    useObjectStore.getState().addObject(obj1);
    useObjectStore.getState().addObject(obj2);
    useHistoryStore.getState().recordDeleteMany(["obj-1", "obj-2"]);

    expect(useObjectStore.getState().objects["obj-1"]).toBeUndefined();
    expect(useObjectStore.getState().objects["obj-2"]).toBeUndefined();
    expect(useHistoryStore.getState().undoStack).toHaveLength(2);
  });
});
