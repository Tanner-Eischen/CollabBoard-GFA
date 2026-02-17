import { describe, expect, it } from "vitest";
import {
  createBoardSchema,
  shareLinkParamSchema,
} from "../lib/validators/board.js";
import {
  createObjectSchema,
  updateObjectSchema,
  objectIdParamSchema,
  boardIdQuerySchema,
  batchCreateObjectSchema,
  batchUpdateObjectSchema,
  batchDeleteObjectSchema,
} from "../lib/validators/object.js";

describe("validation schemas", () => {
  it("defaults board name when omitted", () => {
    const parsed = createBoardSchema.parse({});
    expect(parsed.name).toBe("Untitled Board");
  });

  it("rejects invalid board name", () => {
    const parsed = createBoardSchema.safeParse({ name: "" });
    expect(parsed.success).toBe(false);
  });

  it("validates share link param", () => {
    expect(shareLinkParamSchema.safeParse({ shareLink: "abc123XYZ" }).success).toBe(true);
    expect(shareLinkParamSchema.safeParse({ shareLink: "invalid link!" }).success).toBe(false);
  });

  it("rejects object create with invalid boardId", () => {
    const parsed = createObjectSchema.safeParse({
      boardId: "not-a-uuid",
      type: "sticky",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts valid object create payload", () => {
    const parsed = createObjectSchema.safeParse({
      boardId: "550e8400-e29b-41d4-a716-446655440000",
      type: "sticky",
      x: 10,
      y: 20,
      width: 100,
      height: 50,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.rotation).toBe(0);
      expect(parsed.data.zIndex).toBe(0);
    }
  });

  it("accepts object create with optional width/height", () => {
    const parsed = createObjectSchema.safeParse({
      boardId: "550e8400-e29b-41d4-a716-446655440000",
      type: "line",
      x: 0,
      y: 0,
    });
    expect(parsed.success).toBe(true);
  });

  it("validates update object partial", () => {
    const parsed = updateObjectSchema.safeParse({ x: 5 });
    expect(parsed.success).toBe(true);
  });

  it("validates objectId param", () => {
    expect(objectIdParamSchema.safeParse({ id: "550e8400-e29b-41d4-a716-446655440000" }).success).toBe(true);
    expect(objectIdParamSchema.safeParse({ id: "bad" }).success).toBe(false);
  });

  it("validates boardId query", () => {
    expect(boardIdQuerySchema.safeParse({ boardId: "550e8400-e29b-41d4-a716-446655440000" }).success).toBe(true);
  });

  it("validates batch create schema", () => {
    const valid = batchCreateObjectSchema.safeParse({
      objects: [
        {
          boardId: "550e8400-e29b-41d4-a716-446655440000",
          type: "sticky",
          x: 0,
          y: 0,
        },
      ],
    });
    expect(valid.success).toBe(true);
    const empty = batchCreateObjectSchema.safeParse({ objects: [] });
    expect(empty.success).toBe(false);
  });

  it("validates batch update schema", () => {
    const valid = batchUpdateObjectSchema.safeParse({
      updates: [
        { id: "550e8400-e29b-41d4-a716-446655440000", data: { x: 1 } },
      ],
    });
    expect(valid.success).toBe(true);
  });

  it("validates batch delete schema", () => {
    const valid = batchDeleteObjectSchema.safeParse({
      ids: ["550e8400-e29b-41d4-a716-446655440000"],
    });
    expect(valid.success).toBe(true);
    const empty = batchDeleteObjectSchema.safeParse({ ids: [] });
    expect(empty.success).toBe(false);
  });
});
