import { describe, expect, it, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useToolStore } from "@/stores/toolStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useObjectStore } from "@/stores/objectStore";
import { useClipboardStore } from "@/stores/clipboardStore";
import { useHistoryStore } from "@/stores/historyStore";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { apiToken: "test-token" },
    status: "authenticated",
  }),
}));

vi.mock("@/lib/api/objects", () => ({
  createObjectsBatch: vi.fn().mockResolvedValue([
    { id: "server-1", type: "rectangle", x: 30, y: 30, boardId: "board-1", data: {}, width: 100, height: 80, rotation: 0, zIndex: 0, createdAt: "", updatedAt: "" },
  ]),
  deleteObjectsBatch: vi.fn().mockResolvedValue({ deleted: 1 }),
}));

describe("useKeyboardShortcuts", () => {
  beforeEach(() => {
    useToolStore.setState({ activeTool: "select" });
    useSelectionStore.getState().clear();
    useSelectionStore.getState().setBoardId("board-1");
    useObjectStore.getState().setBoardId("board-1");
    useObjectStore.getState().clear();
    useClipboardStore.getState().clear();
    useHistoryStore.getState().setBoardId("board-1");
  });

  it("registers keydown listener", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts("board-1", "connected")
    );
    expect(addSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("switches tool on V key", () => {
    renderHook(() => useKeyboardShortcuts("board-1", "connected"));
    expect(useToolStore.getState().activeTool).toBe("select");
    expect(useToolStore.getState().setActiveTool).toBeDefined();
    // Simulate keydown - we need to dispatch
    const evt = new KeyboardEvent("keydown", { key: "v", bubbles: true });
    vi.spyOn(evt, "preventDefault");
    window.dispatchEvent(evt);
    // Tool stays select (V is select) - verify no error
    expect(useToolStore.getState().activeTool).toBe("select");
  });

  it("switches tool on R key to rectangle", () => {
    renderHook(() => useKeyboardShortcuts("board-1", "connected"));
    const evt = new KeyboardEvent("keydown", { key: "r", bubbles: true });
    window.dispatchEvent(evt);
    expect(useToolStore.getState().activeTool).toBe("rectangle");
  });

  it("select-all adds all board objects to selection", () => {
    useObjectStore.getState().addObject({
      id: "obj-1",
      type: "rectangle",
      x: 0,
      y: 0,
      width: 100,
      height: 80,
      rotation: 0,
      zIndex: 0,
      data: {},
      boardId: "board-1",
      createdAt: "",
      updatedAt: "",
    });
    useObjectStore.getState().addObject({
      id: "obj-2",
      type: "circle",
      x: 50,
      y: 50,
      width: 60,
      height: 60,
      rotation: 0,
      zIndex: 1,
      data: {},
      boardId: "board-1",
      createdAt: "",
      updatedAt: "",
    });
    renderHook(() => useKeyboardShortcuts("board-1", "connected"));
    const evt = new KeyboardEvent("keydown", {
      key: "a",
      ctrlKey: true,
      bubbles: true,
    });
    window.dispatchEvent(evt);
    expect(useSelectionStore.getState().selectedIds).toContain("obj-1");
    expect(useSelectionStore.getState().selectedIds).toContain("obj-2");
  });

  it("copy stores selected objects in clipboard", () => {
    useObjectStore.getState().addObject({
      id: "obj-1",
      type: "rectangle",
      x: 10,
      y: 20,
      width: 100,
      height: 80,
      rotation: 0,
      zIndex: 0,
      data: { fill: "#ff0000" },
      boardId: "board-1",
      createdAt: "",
      updatedAt: "",
    });
    useSelectionStore.getState().select("obj-1");
    renderHook(() => useKeyboardShortcuts("board-1", "connected"));
    const evt = new KeyboardEvent("keydown", {
      key: "c",
      ctrlKey: true,
      bubbles: true,
    });
    window.dispatchEvent(evt);
    const clipboard = useClipboardStore.getState().get();
    expect(clipboard).toHaveLength(1);
    expect(clipboard[0]).toMatchObject({ type: "rectangle", x: 10, y: 20 });
    expect(clipboard[0]).not.toHaveProperty("id");
  });

  it("delete removes selected objects from store", () => {
    const serverId = "550e8400-e29b-41d4-a716-446655440001";
    useObjectStore.getState().addObject({
      id: serverId,
      type: "rectangle",
      x: 0,
      y: 0,
      width: 100,
      height: 80,
      rotation: 0,
      zIndex: 0,
      data: {},
      boardId: "board-1",
      createdAt: "",
      updatedAt: "",
    });
    useSelectionStore.getState().select(serverId);
    renderHook(() => useKeyboardShortcuts("board-1", "connected"));
    act(() => {
      const evt = new KeyboardEvent("keydown", { key: "Delete", bubbles: true });
      window.dispatchEvent(evt);
    });
    expect(useObjectStore.getState().objects[serverId]).toBeUndefined();
  });
});
