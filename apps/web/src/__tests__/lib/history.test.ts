import { describe, expect, it } from "vitest";
import { pushWithCap, computeAfterState } from "@/lib/history";
import type { CanvasObject } from "@collabboard/shared";

const makeObject = (overrides: Partial<CanvasObject> = {}): CanvasObject => ({
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

describe("history", () => {
  describe("pushWithCap", () => {
    it("appends entry when under cap", () => {
      const stack: number[] = [];
      const next = pushWithCap(stack, 1, 50);
      expect(next).toEqual([1]);
    });

    it("drops oldest when over cap", () => {
      const stack = Array.from({ length: 50 }, (_, i) => i);
      const next = pushWithCap(stack, 99, 50);
      expect(next).toHaveLength(50);
      expect(next[0]).toBe(1);
      expect(next[49]).toBe(99);
    });

    it("respects cap of 1", () => {
      const next = pushWithCap([1], 2, 1);
      expect(next).toEqual([2]);
    });
  });

  describe("computeAfterState", () => {
    it("merges partial update into object", () => {
      const before = makeObject({ x: 10, y: 20 });
      const after = computeAfterState(before, { x: 30 });
      expect(after.x).toBe(30);
      expect(after.y).toBe(20);
      expect(after.updatedAt).not.toBe(before.updatedAt);
    });

    it("preserves unchanged fields", () => {
      const before = makeObject({ width: 100, height: 80 });
      const after = computeAfterState(before, { x: 5 });
      expect(after.width).toBe(100);
      expect(after.height).toBe(80);
    });
  });
});
