import { describe, it, expect, vi, beforeEach } from "vitest";
import { socketAuthMiddleware } from "../socket/auth.js";

vi.mock("../lib/auth/session.js", () => ({
  verifySessionToken: vi.fn(),
}));

const { verifySessionToken } = await import("../lib/auth/session.js");

function mockSocket(overrides: Partial<{ auth: unknown; headers: Record<string, string> }> = {}) {
  return {
    handshake: {
      auth: overrides.auth ?? {},
      headers: overrides.headers ?? {},
    },
    data: {} as Record<string, unknown>,
  } as import("socket.io").Socket;
}

describe("socketAuthMiddleware", () => {
  beforeEach(() => {
    vi.mocked(verifySessionToken).mockReset();
  });

  it("rejects when no token provided", async () => {
    const socket = mockSocket();
    const next = vi.fn();

    await socketAuthMiddleware(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(socket.data.userId).toBeUndefined();
  });

  it("rejects when token is invalid", async () => {
    vi.mocked(verifySessionToken).mockResolvedValue(null);
    const socket = mockSocket({ auth: { token: "invalid" } });
    const next = vi.fn();

    await socketAuthMiddleware(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(socket.data.userId).toBeUndefined();
  });

  it("accepts valid token from auth", async () => {
    vi.mocked(verifySessionToken).mockResolvedValue({ userId: "user-123" });
    const socket = mockSocket({ auth: { token: "valid-jwt" } });
    const next = vi.fn();

    await socketAuthMiddleware(socket, next);

    expect(next).toHaveBeenCalledWith();
    expect(socket.data.userId).toBe("user-123");
  });

  it("accepts token from Authorization header", async () => {
    vi.mocked(verifySessionToken).mockResolvedValue({ userId: "user-456" });
    const socket = mockSocket({
      headers: { authorization: "Bearer header-token" },
    });
    const next = vi.fn();

    await socketAuthMiddleware(socket, next);

    expect(verifySessionToken).toHaveBeenCalledWith("header-token");
    expect(next).toHaveBeenCalledWith();
    expect(socket.data.userId).toBe("user-456");
  });
});
