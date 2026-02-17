import { describe, it, expect, vi } from "vitest";
import { apiClient } from "@/lib/api/client";

describe("apiClient", () => {
  it("includes Authorization header when token provided", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    await apiClient("/api/me", { token: "test-token" });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
    const call = fetchSpy.mock.calls[0];
    const headers = call[1]?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer test-token");
  });

  it("throws on non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: "Unauthorized" }),
    } as Response);

    await expect(apiClient("/api/me")).rejects.toThrow("Unauthorized");
  });
});
