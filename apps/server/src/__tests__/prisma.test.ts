import { describe, expect, it } from "vitest";
import { prisma } from "../lib/prisma.js";

describe("Prisma client", () => {
  it("exports a singleton instance", async () => {
    const { prisma: prisma2 } = await import("../lib/prisma.js");
    expect(prisma).toBe(prisma2);
  });

  it("has expected models", () => {
    expect(prisma.user).toBeDefined();
    expect(prisma.board).toBeDefined();
    expect(prisma.object).toBeDefined();
    expect(prisma.session).toBeDefined();
  });
});
