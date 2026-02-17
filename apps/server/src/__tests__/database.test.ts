import { describe, expect, it } from "vitest";
import { prisma } from "../lib/prisma.js";

describe("Database connection", () => {
  it.skipIf(!process.env.DATABASE_URL)(
    "can connect and run a query",
    async () => {
      const result = await prisma.$queryRaw<[{ count: bigint }]>`SELECT 1 as count`;
      expect(result).toHaveLength(1);
      expect(Number(result[0].count)).toBe(1);
    }
  );
});
