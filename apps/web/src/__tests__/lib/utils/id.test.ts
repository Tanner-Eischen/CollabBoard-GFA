import { describe, expect, it } from "vitest";
import { createClientId, isClientId } from "@/lib/utils/id";

describe("id utils", () => {
  it("createClientId returns string with client: prefix", () => {
    const id = createClientId();
    expect(id).toMatch(/^client:/);
    expect(id.length).toBeGreaterThan(7);
  });

  it("createClientId returns unique ids", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 10; i++) {
      ids.add(createClientId());
    }
    expect(ids.size).toBe(10);
  });

  it("isClientId returns true for client ids", () => {
    expect(isClientId("client:abc")).toBe(true);
    expect(isClientId(createClientId())).toBe(true);
  });

  it("isClientId returns false for server ids", () => {
    expect(isClientId("550e8400-e29b-41d4-a716-446655440000")).toBe(false);
    expect(isClientId("")).toBe(false);
  });
});
