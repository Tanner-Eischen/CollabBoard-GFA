import { describe, it, expect } from "vitest";
import { createBoardSchema, updateBoardSchema, boardIdParamSchema } from "../lib/validators/board.js";
import { createObjectSchema, objectIdParamSchema } from "../lib/validators/object.js";

describe("board validators", () => {
  it("createBoardSchema accepts valid input", () => {
    expect(createBoardSchema.parse({})).toEqual({ name: "Untitled Board" });
    expect(createBoardSchema.parse({ name: "My Board" })).toEqual({ name: "My Board" });
  });

  it("createBoardSchema rejects invalid name", () => {
    expect(() => createBoardSchema.parse({ name: "" })).toThrow();
    expect(() => createBoardSchema.parse({ name: "x".repeat(256) })).toThrow();
  });

  it("updateBoardSchema requires name", () => {
    expect(updateBoardSchema.parse({ name: "New Name" })).toEqual({ name: "New Name" });
    expect(() => updateBoardSchema.parse({})).toThrow();
  });

  it("boardIdParamSchema validates UUID", () => {
    expect(boardIdParamSchema.parse({ id: "550e8400-e29b-41d4-a716-446655440000" })).toEqual({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(() => boardIdParamSchema.parse({ id: "not-uuid" })).toThrow();
  });
});

describe("object validators", () => {
  it("createObjectSchema requires boardId and dimensions", () => {
    const valid = {
      boardId: "550e8400-e29b-41d4-a716-446655440000",
      type: "rectangle",
      x: 0,
      y: 0,
      width: 100,
      height: 50,
    };
    expect(createObjectSchema.parse(valid)).toBeDefined();
    expect(() => createObjectSchema.parse({})).toThrow();
  });

  it("objectIdParamSchema validates UUID", () => {
    expect(objectIdParamSchema.parse({ id: "550e8400-e29b-41d4-a716-446655440000" })).toBeDefined();
    expect(() => objectIdParamSchema.parse({ id: "x" })).toThrow();
  });
});
