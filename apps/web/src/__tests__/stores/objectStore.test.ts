import { describe, expect, it, beforeEach } from "vitest";
import { useObjectStore, getObjectsByBoardId, getObjectById } from "@/stores/objectStore";

describe("objectStore", () => {
  beforeEach(() => {
    useObjectStore.getState().clear();
  });

  it("sets and gets objects by board", () => {
    const store = useObjectStore.getState();
    const obj = {
      id: "obj-1",
      type: "sticky",
      data: {},
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: 0,
      boardId: "board-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.setObjects([obj]);
    const byBoard = getObjectsByBoardId(useObjectStore.getState(), "board-1");
    expect(byBoard).toHaveLength(1);
    expect(byBoard[0]?.id).toBe("obj-1");
  });

  it("addOptimistic creates placeholder and returns client ID", () => {
    const store = useObjectStore.getState();
    const clientId = store.addOptimistic({
      boardId: "board-1",
      type: "sticky",
      x: 10,
      y: 20,
    });
    expect(clientId).toMatch(/^client:/);
    const obj = getObjectById(useObjectStore.getState(), clientId);
    expect(obj).toBeDefined();
    expect(obj?.type).toBe("sticky");
    expect(obj?.x).toBe(10);
  });

  it("confirmOptimistic replaces client ID with server object", () => {
    const store = useObjectStore.getState();
    const clientId = store.addOptimistic({
      boardId: "board-1",
      type: "sticky",
      x: 0,
      y: 0,
    });
    const serverObj = {
      id: "server-obj-1",
      type: "sticky",
      data: {},
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: 0,
      boardId: "board-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.confirmOptimistic(clientId, serverObj);
    expect(getObjectById(useObjectStore.getState(), clientId)).toBeUndefined();
    expect(getObjectById(useObjectStore.getState(), "server-obj-1")).toEqual(serverObj);
  });

  it("rollbackOptimistic removes placeholder", () => {
    const store = useObjectStore.getState();
    const clientId = store.addOptimistic({
      boardId: "board-1",
      type: "sticky",
      x: 0,
      y: 0,
    });
    store.rollbackOptimistic(clientId);
    expect(getObjectById(useObjectStore.getState(), clientId)).toBeUndefined();
  });

  it("updateObject applies optimistic update with bumped updatedAt", () => {
    const store = useObjectStore.getState();
    const obj = {
      id: "obj-1",
      type: "sticky",
      data: {},
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: 0,
      boardId: "board-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    store.addObject(obj);
    store.updateObject("obj-1", { x: 50, y: 60 });
    const updated = getObjectById(useObjectStore.getState(), "obj-1");
    expect(updated?.x).toBe(50);
    expect(updated?.y).toBe(60);
    expect(updated?.updatedAt).not.toBe(obj.updatedAt);
  });

  it("reconcileUpdate applies server object when server is newer (LWW)", () => {
    const store = useObjectStore.getState();
    const local = {
      id: "obj-1",
      type: "sticky",
      data: {},
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: 0,
      boardId: "board-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T12:00:00.000Z",
    };
    store.addObject(local);
    const server = {
      ...local,
      x: 20,
      y: 20,
      updatedAt: "2026-01-01T12:00:01.000Z",
    };
    store.reconcileUpdate(server);
    const result = getObjectById(useObjectStore.getState(), "obj-1");
    expect(result?.x).toBe(20);
    expect(result?.y).toBe(20);
  });

  it("reconcileUpdate skips when local is newer (avoids stale overwrite)", () => {
    const store = useObjectStore.getState();
    const local = {
      id: "obj-1",
      type: "sticky",
      data: {},
      x: 20,
      y: 20,
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: 0,
      boardId: "board-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T12:00:01.000Z",
    };
    store.addObject(local);
    const server = {
      ...local,
      x: 10,
      y: 10,
      updatedAt: "2026-01-01T12:00:00.000Z",
    };
    store.reconcileUpdate(server);
    const result = getObjectById(useObjectStore.getState(), "obj-1");
    expect(result?.x).toBe(20);
    expect(result?.y).toBe(20);
  });

  it("reconcileUpdate adds object when not present", () => {
    const store = useObjectStore.getState();
    const server = {
      id: "new-obj",
      type: "sticky",
      data: {},
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: 0,
      boardId: "board-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T12:00:00.000Z",
    };
    store.reconcileUpdate(server);
    expect(getObjectById(useObjectStore.getState(), "new-obj")).toEqual(server);
  });
});
