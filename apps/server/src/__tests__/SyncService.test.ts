import { describe, expect, it, vi } from "vitest";
import * as SyncService from "../services/SyncService.js";

describe("SyncService", () => {
  describe("isNewerOrEqual", () => {
    it("returns true when a >= b", () => {
      expect(SyncService.isNewerOrEqual("2026-01-01T12:00:01.000Z", "2026-01-01T12:00:00.000Z")).toBe(
        true
      );
      expect(SyncService.isNewerOrEqual("2026-01-01T12:00:00.000Z", "2026-01-01T12:00:00.000Z")).toBe(
        true
      );
    });

    it("returns false when a < b", () => {
      expect(SyncService.isNewerOrEqual("2026-01-01T12:00:00.000Z", "2026-01-01T12:00:01.000Z")).toBe(
        false
      );
    });
  });

  it("toObjectJson converts ObjectRecord to JSON shape", () => {
    const obj = {
      id: "obj-1",
      type: "rectangle",
      data: { fill: "red" },
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      rotation: 0,
      zIndex: 1,
      boardId: "board-1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    };
    const json = SyncService.toObjectJson(obj);
    expect(json.id).toBe("obj-1");
    expect(json.type).toBe("rectangle");
    expect(json.data).toEqual({ fill: "red" });
    expect(json.x).toBe(10);
    expect(json.y).toBe(20);
    expect(json.boardId).toBe("board-1");
    expect(json.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(json.updatedAt).toBe("2026-01-02T00:00:00.000Z");
  });

  it("broadcastObjectCreated emits to room", async () => {
    const emit = vi.fn();
    const io = { to: vi.fn().mockReturnValue({ emit }) } as unknown as import("socket.io").Server;
    const obj = {
      id: "obj-1",
      type: "rectangle",
      data: {},
      x: 0,
      y: 0,
      width: null,
      height: null,
      rotation: 0,
      zIndex: 0,
      boardId: "b1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    SyncService.broadcastObjectCreated(io, "b1", obj);
    expect(io.to).toHaveBeenCalledWith("board:b1");
    expect(emit).toHaveBeenCalledWith(
      "object:created",
      expect.objectContaining({
        object: expect.objectContaining({ id: "obj-1", boardId: "b1" }),
        boardId: "b1",
        timestamp: expect.any(String),
      })
    );
  });

  it("broadcastObjectDeleted emits to room", async () => {
    const emit = vi.fn();
    const io = { to: vi.fn().mockReturnValue({ emit }) } as unknown as import("socket.io").Server;
    SyncService.broadcastObjectDeleted(io, "b1", "obj-1");
    expect(io.to).toHaveBeenCalledWith("board:b1");
    expect(emit).toHaveBeenCalledWith(
      "object:deleted",
      expect.objectContaining({
        id: "obj-1",
        boardId: "b1",
        timestamp: expect.any(String),
      })
    );
  });
});
