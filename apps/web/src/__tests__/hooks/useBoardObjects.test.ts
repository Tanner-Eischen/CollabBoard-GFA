import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useBoardObjects } from "@/hooks/useBoardObjects";
import { useObjectStore } from "@/stores/objectStore";
import { clearAllSynced } from "@/lib/socket/syncState";

function makeSocket() {
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};
  const sock = {
    on: vi.fn((event: string, fn: (...args: unknown[]) => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event]!.push(fn);
      return sock;
    }),
    off: vi.fn((event: string, fn?: (...args: unknown[]) => void) => {
      if (!listeners[event]) return sock;
      if (fn) {
        listeners[event] = listeners[event]!.filter((l) => l !== fn);
      } else {
        listeners[event] = [];
      }
      return sock;
    }),
    emit: vi.fn(),
    connected: true,
    _emit(event: string, payload: unknown) {
      (listeners[event] ?? []).forEach((fn) => fn(payload));
    },
  };
  return sock;
}

describe("useBoardObjects", () => {
  beforeEach(() => {
    useObjectStore.getState().clear();
    clearAllSynced();
  });

  it("sets objects on objects:list", () => {
    const socket = makeSocket();
    renderHook(() => useBoardObjects("board-1", socket as never));

    act(() => {
      socket._emit("objects:list", {
        boardId: "board-1",
        objects: [
          {
            id: "obj-1",
            type: "rectangle",
            data: {},
            x: 10,
            y: 20,
            width: 100,
            height: 50,
            rotation: 0,
            zIndex: 0,
            boardId: "board-1",
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z",
          },
        ],
        timestamp: new Date().toISOString(),
      });
    });

    const objects = useObjectStore.getState().objects;
    expect(Object.keys(objects)).toHaveLength(1);
    expect(objects["obj-1"]).toMatchObject({
      id: "obj-1",
      type: "rectangle",
      x: 10,
      y: 20,
    });
  });

  it("adds object on object:created", () => {
    const socket = makeSocket();
    renderHook(() => useBoardObjects("board-1", socket as never));

    act(() => {
      socket._emit("object:created", {
        boardId: "board-1",
        object: {
          id: "obj-new",
          type: "circle",
          data: {},
          x: 0,
          y: 0,
          width: null,
          height: null,
          rotation: 0,
          zIndex: 0,
          boardId: "board-1",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
        timestamp: new Date().toISOString(),
      });
    });

    const objects = useObjectStore.getState().objects;
    expect(objects["obj-new"]).toMatchObject({ id: "obj-new", type: "circle" });
  });

  it("removes object on object:deleted", () => {
    const socket = makeSocket();
    useObjectStore.getState().addObject({
      id: "obj-1",
      type: "rectangle",
      data: {},
      x: 0,
      y: 0,
      width: null,
      height: null,
      rotation: 0,
      zIndex: 0,
      boardId: "board-1",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    });

    renderHook(() => useBoardObjects("board-1", socket as never));

    act(() => {
      socket._emit("object:deleted", {
        boardId: "board-1",
        id: "obj-1",
        timestamp: new Date().toISOString(),
      });
    });

    const objects = useObjectStore.getState().objects;
    expect(objects["obj-1"]).toBeUndefined();
  });

  it("updates object on object:updated with LWW reconciliation", () => {
    const socket = makeSocket();
    useObjectStore.getState().addObject({
      id: "obj-1",
      type: "rectangle",
      data: {},
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      rotation: 0,
      zIndex: 0,
      boardId: "board-1",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T12:00:00Z",
    });

    renderHook(() => useBoardObjects("board-1", socket as never));

    act(() => {
      socket._emit("object:updated", {
        boardId: "board-1",
        object: {
          id: "obj-1",
          type: "rectangle",
          data: {},
          x: 50,
          y: 60,
          width: 100,
          height: 50,
          rotation: 0,
          zIndex: 0,
          boardId: "board-1",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T12:00:01Z",
        },
        timestamp: new Date().toISOString(),
      });
    });

    const objects = useObjectStore.getState().objects;
    expect(objects["obj-1"]).toMatchObject({ x: 50, y: 60 });
  });

  it("ignores events for other boards", () => {
    const socket = makeSocket();
    renderHook(() => useBoardObjects("board-1", socket as never));

    act(() => {
      socket._emit("object:created", {
        boardId: "board-2",
        object: {
          id: "obj-other",
          type: "rectangle",
          data: {},
          x: 0,
          y: 0,
          width: null,
          height: null,
          rotation: 0,
          zIndex: 0,
          boardId: "board-2",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
        timestamp: new Date().toISOString(),
      });
    });

    const objects = useObjectStore.getState().objects;
    expect(objects["obj-other"]).toBeUndefined();
  });
});
