import { describe, expect, it } from "vitest";
import {
  isNewerOrEqual,
  shouldAcceptServer,
  reconcileObject,
  applyOptimisticUpdate,
  isObjectDisplayEqual,
} from "@/lib/optimistic";
import type { CanvasObject } from "@collabboard/shared";

function makeObject(overrides: Partial<CanvasObject> = {}): CanvasObject {
  return {
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
    ...overrides,
  };
}

describe("optimistic", () => {
  describe("isNewerOrEqual", () => {
    it("returns true when a is same as b", () => {
      const t = "2026-01-01T12:00:00.000Z";
      expect(isNewerOrEqual(t, t)).toBe(true);
    });

    it("returns true when a is newer than b", () => {
      expect(isNewerOrEqual("2026-01-01T12:00:01.000Z", "2026-01-01T12:00:00.000Z")).toBe(true);
    });

    it("returns false when a is older than b", () => {
      expect(isNewerOrEqual("2026-01-01T12:00:00.000Z", "2026-01-01T12:00:01.000Z")).toBe(false);
    });
  });

  describe("shouldAcceptServer", () => {
    it("accepts when local is undefined", () => {
      const server = makeObject({ updatedAt: "2026-01-01T12:00:00.000Z" });
      expect(shouldAcceptServer(undefined, server)).toBe(true);
    });

    it("accepts when server.updatedAt >= local.updatedAt", () => {
      const local = makeObject({ updatedAt: "2026-01-01T12:00:00.000Z" });
      const server = makeObject({ updatedAt: "2026-01-01T12:00:01.000Z" });
      expect(shouldAcceptServer(local, server)).toBe(true);
    });

    it("rejects when local.updatedAt > server.updatedAt", () => {
      const local = makeObject({ updatedAt: "2026-01-01T12:00:01.000Z" });
      const server = makeObject({ updatedAt: "2026-01-01T12:00:00.000Z" });
      expect(shouldAcceptServer(local, server)).toBe(false);
    });
  });

  describe("reconcileObject", () => {
    it("returns server when local is undefined", () => {
      const server = makeObject();
      expect(reconcileObject(undefined, server)).toBe(server);
    });

    it("returns server when server is newer (LWW)", () => {
      const local = makeObject({ x: 10, updatedAt: "2026-01-01T12:00:00.000Z" });
      const server = makeObject({ x: 20, updatedAt: "2026-01-01T12:00:01.000Z" });
      expect(reconcileObject(local, server)).toEqual(server);
    });

    it("returns null when local is newer (skip stale server)", () => {
      const local = makeObject({ x: 20, updatedAt: "2026-01-01T12:00:01.000Z" });
      const server = makeObject({ x: 10, updatedAt: "2026-01-01T12:00:00.000Z" });
      expect(reconcileObject(local, server)).toBeNull();
    });
  });

  describe("applyOptimisticUpdate", () => {
    it("merges partial data and bumps updatedAt", () => {
      const obj = makeObject({ x: 0, y: 0, updatedAt: "2026-01-01T12:00:00.000Z" });
      const result = applyOptimisticUpdate(obj, { x: 10, y: 20 });
      expect(result.x).toBe(10);
      expect(result.y).toBe(20);
      expect(result.updatedAt).not.toBe(obj.updatedAt);
      expect(new Date(result.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(obj.updatedAt).getTime()
      );
    });

    it("merges nested data", () => {
      const obj = makeObject({ data: { text: "hello" } });
      const result = applyOptimisticUpdate(obj, { data: { text: "world" } });
      expect(result.data).toEqual({ text: "world" });
    });
  });

  describe("isObjectDisplayEqual", () => {
    it("returns true for identical objects", () => {
      const a = makeObject();
      const b = { ...a };
      expect(isObjectDisplayEqual(a, b)).toBe(true);
    });

    it("returns false when x differs", () => {
      const a = makeObject({ x: 0 });
      const b = makeObject({ x: 10 });
      expect(isObjectDisplayEqual(a, b)).toBe(false);
    });

    it("returns true when only updatedAt differs (avoids flicker)", () => {
      const a = makeObject({ updatedAt: "2026-01-01T12:00:00.000Z" });
      const b = makeObject({ updatedAt: "2026-01-01T12:00:01.000Z" });
      expect(isObjectDisplayEqual(a, b)).toBe(true);
    });
  });
});
