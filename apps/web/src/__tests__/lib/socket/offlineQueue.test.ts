import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  enqueue,
  flush,
  clearQueue,
  getQueue,
  queueLength,
} from "@/lib/socket/offlineQueue";

vi.mock("@/lib/api/objects", () => ({
  createObject: vi.fn().mockResolvedValue({ id: "created-1" }),
  updateObject: vi.fn().mockResolvedValue({ id: "obj-1" }),
  deleteObject: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/stores/objectStore", () => ({
  useObjectStore: {
    getState: () => ({
      confirmOptimistic: vi.fn(),
    }),
  },
}));

vi.mock("@/stores/historyStore", () => ({
  useHistoryStore: {
    getState: () => ({
      recordCreate: vi.fn(),
    }),
  },
}));

describe("offlineQueue", () => {
  beforeEach(() => {
    clearQueue();
    vi.clearAllMocks();
  });

  it("enqueues and returns queue length", () => {
    enqueue({
      type: "object:update",
      id: "obj-1",
      payload: { x: 10, y: 20 },
    });
    expect(queueLength()).toBe(1);
    expect(getQueue()).toHaveLength(1);
  });

  it("clears queue", () => {
    enqueue({ type: "object:update", id: "x", payload: {} });
    clearQueue();
    expect(queueLength()).toBe(0);
  });

  it("flush runs queued update and removes from queue", async () => {
    const objectsApi = await import("@/lib/api/objects");
    enqueue({
      type: "object:update",
      id: "obj-1",
      payload: { x: 10, y: 20 },
    });

    const flushed = await flush("token");

    expect(flushed).toBe(1);
    expect(objectsApi.updateObject).toHaveBeenCalledWith("token", "obj-1", {
      x: 10,
      y: 20,
    });
    expect(queueLength()).toBe(0);
  });

  it("flush runs create and delete ops in order", async () => {
    const objectsApi = await import("@/lib/api/objects");
    enqueue({
      type: "object:create",
      payload: {
        boardId: "b1",
        type: "rectangle",
        x: 0,
        y: 0,
      },
      clientId: "client:test-1",
    });
    enqueue({
      type: "object:delete",
      id: "obj-1",
    });

    const flushed = await flush("token");

    expect(flushed).toBe(2);
    expect(objectsApi.createObject).toHaveBeenCalledWith("token", {
      boardId: "b1",
      type: "rectangle",
      x: 0,
      y: 0,
    });
    expect(objectsApi.deleteObject).toHaveBeenCalledWith("token", "obj-1");
  });

  it("flush stops on first error and leaves remaining in queue", async () => {
    const objectsApi = await import("@/lib/api/objects");
    vi.mocked(objectsApi.updateObject).mockRejectedValueOnce(new Error("fail"));

    enqueue({ type: "object:update", id: "obj-1", payload: { x: 1 } });
    enqueue({ type: "object:update", id: "obj-2", payload: { x: 2 } });

    const flushed = await flush("token");

    expect(flushed).toBe(0);
    expect(queueLength()).toBe(2);
  });
});
