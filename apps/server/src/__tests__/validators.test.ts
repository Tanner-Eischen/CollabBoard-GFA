import { describe, expect, it } from "vitest";
import { createBoardSchema } from "../lib/validators/board.js";
import { createObjectSchema } from "../lib/validators/object.js";

describe("validation schemas", () => {
  it("defaults board name when omitted", () => {
    const parsed = createBoardSchema.parse({});
    expect(parsed.name).toBe("Untitled Board");
  });

  it("rejects invalid board name", () => {
    const parsed = createBoardSchema.safeParse({ name: "" });
    expect(parsed.success).toBe(false);
  });

  it("validates required object payload fields", () => {
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
});
