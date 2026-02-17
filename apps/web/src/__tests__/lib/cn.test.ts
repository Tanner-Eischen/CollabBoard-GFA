import { describe, expect, it } from "vitest";
import { cn } from "../../lib/utils/cn";

describe("cn utility", () => {
  it("merges class names", () => {
    expect(cn("p-2", "text-sm")).toBe("p-2 text-sm");
  });

  it("deduplicates conflicting Tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
