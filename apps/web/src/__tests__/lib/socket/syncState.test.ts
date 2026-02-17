import { describe, expect, it, beforeEach } from "vitest";
import {
  markSynced,
  markSyncedMany,
  isDirty,
  clearSynced,
  clearAllSynced,
} from "@/lib/socket/syncState";
import type { CanvasObject } from "@collabboard/shared";

function makeObject(overrides: Partial<CanvasObject> = {}): CanvasObject {
  return {
    id: "obj-1",
    type: "rectangle",
    data: {},
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    rotation: 0,
    zIndex: 0,
    boardId: "b1",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("syncState", () => {
  beforeEach(() => {
    clearAllSynced();
  });

  it("isDirty returns true when never synced", () => {
    const obj = makeObject();
    expect(isDirty(obj)).toBe(true);
  });

  it("isDirty returns false when synced and unchanged", () => {
    const obj = makeObject();
    markSynced(obj);
    expect(isDirty(obj)).toBe(false);
  });

  it("isDirty returns true when synced but object changed", () => {
    const obj = makeObject();
    markSynced(obj);
    const changed = makeObject({ ...obj, x: 10 });
    expect(isDirty(changed)).toBe(true);
  });

  it("markSyncedMany marks all objects", () => {
    const objs = [makeObject({ id: "a" }), makeObject({ id: "b" })];
    markSyncedMany(objs);
    expect(isDirty(objs[0]!)).toBe(false);
    expect(isDirty(objs[1]!)).toBe(false);
  });

  it("clearSynced removes from tracking", () => {
    const obj = makeObject();
    markSynced(obj);
    clearSynced(obj.id);
    expect(isDirty(obj)).toBe(true);
  });
});
