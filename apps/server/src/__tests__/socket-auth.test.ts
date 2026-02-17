import { SignJWT } from "jose";
import { describe, expect, it, vi } from "vitest";
import { socketAuthMiddleware } from "../socket/auth.js";

describe("socket auth middleware", () => {
  it("rejects missing token", async () => {
    const next = vi.fn();
    const socket = {
      handshake: { auth: {}, headers: {} },
      data: {},
    } as never;

    await socketAuthMiddleware(socket, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(Error);
  });

  it("accepts valid token and attaches userId", async () => {
    process.env.NEXTAUTH_SECRET = "test-secret";
    const token = await new SignJWT({ userId: "socket-user" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("test-secret"));

    const next = vi.fn();
    const socket = {
      handshake: { auth: { token }, headers: {} },
      data: {},
    } as never;

    await socketAuthMiddleware(socket, next);

    expect(next).toHaveBeenCalledWith();
    expect((socket as { data: { userId?: string } }).data.userId).toBe(
      "socket-user"
    );
  });
});
