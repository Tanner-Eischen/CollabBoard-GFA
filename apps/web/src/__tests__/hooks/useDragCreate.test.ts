import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDragCreate } from "@/hooks/useDragCreate";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { apiToken: "token" },
    status: "authenticated",
  }),
}));

const mockObjectStore = {
  addOptimistic: vi.fn().mockReturnValue("client:test-1"),
  confirmOptimistic: vi.fn(),
  rollbackOptimistic: vi.fn(),
};
vi.mock("@/stores/objectStore", () => ({
  useObjectStore: (selector: (s: unknown) => unknown) => selector(mockObjectStore),
}));

vi.mock("@/stores/historyStore", () => ({
  useHistoryStore: (selector: (s: unknown) => unknown) =>
    selector({ recordCreate: vi.fn() }),
}));

vi.mock("@/stores/canvasStore", () => ({
  useCanvasStore: (selector: (s: unknown) => unknown) => {
    const state = {
      position: { x: 0, y: 0 },
      scale: 1,
    };
    return selector(state);
  },
}));

vi.mock("@/lib/api/objects", () => ({
  createObject: vi.fn().mockResolvedValue({
    id: "server-1",
    type: "rectangle",
    boardId: "b1",
    x: 10,
    y: 20,
    width: 120,
    height: 80,
    data: {},
    rotation: 0,
    zIndex: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  }),
}));

vi.mock("@/lib/socket/offlineQueue", () => ({
  enqueue: vi.fn(),
}));

const mockRecordCreate = vi.fn();
vi.mock("@/stores/historyStore", () => ({
  useHistoryStore: (selector: (s: { recordCreate: () => void }) => unknown) =>
    selector({ recordCreate: mockRecordCreate }),
}));

describe("useDragCreate", () => {
  const containerRef = { current: document.createElement("div") };
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(containerRef.current, {
      getBoundingClientRect: () => ({
        left: 240,
        top: 0,
        width: 800,
        height: 600,
      }),
    });
  });

  it("returns pendingTemplateType null initially", () => {
    const { result } = renderHook(() =>
      useDragCreate({
        boardId: "b1",
        status: "connected",
        containerRef,
      })
    );

    expect(result.current.pendingTemplateType).toBeNull();
  });

  it("sets pendingTemplateType when onClickTemplate is called", () => {
    const { result } = renderHook(() =>
      useDragCreate({
        boardId: "b1",
        status: "connected",
        containerRef,
      })
    );

    act(() => {
      result.current.handlers.onClickTemplate("rectangle");
    });

    expect(result.current.pendingTemplateType).toBe("rectangle");
  });

  it("handleCanvasClick creates object and clears pendingTemplateType", async () => {
    const objectsApi = await import("@/lib/api/objects");

    const { result } = renderHook(() =>
      useDragCreate({
        boardId: "b1",
        status: "connected",
        containerRef,
      })
    );

    act(() => {
      result.current.handlers.onClickTemplate("rectangle");
    });
    expect(result.current.pendingTemplateType).toBe("rectangle");

    act(() => {
      result.current.handleCanvasClick(50, 60);
    });

    expect(mockObjectStore.addOptimistic).toHaveBeenCalled();
    expect(objectsApi.createObject).toHaveBeenCalledWith(
      "token",
      expect.objectContaining({
        boardId: "b1",
        type: "rectangle",
        x: 50,
        y: 60,
      })
    );
    expect(result.current.pendingTemplateType).toBeNull();
  });

  it("handleDrop converts screen coords to stage coords and creates", async () => {
    const objectsApi = await import("@/lib/api/objects");
    const { result } = renderHook(() =>
      useDragCreate({
        boardId: "b1",
        status: "connected",
        containerRef,
      })
    );

    act(() => {
      result.current.handlers.onDragStart("rectangle", "b1", {
        dataTransfer: { getData: () => "" },
      } as unknown as React.DragEvent);
    });

    act(() => {
      result.current.handleDrop(290, 20);
    });

    expect(objectsApi.createObject).toHaveBeenCalledWith(
      "token",
      expect.objectContaining({
        boardId: "b1",
        type: "rectangle",
        x: 50,
        y: 20,
      })
    );
  });
});
