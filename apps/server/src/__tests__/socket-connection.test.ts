import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer } from "http";
import { io as ioClient, type Socket as ClientSocket } from "socket.io-client";
import app from "../app.js";
import { createSocketServer } from "../socket/index.js";

describe("socket connection lifecycle", () => {
  let httpServer: ReturnType<typeof createServer>;
  let client: ClientSocket;

  beforeAll(() => {
    httpServer = createServer(app);
    createSocketServer(httpServer);
    httpServer.listen(3999);
  });

  afterAll(() => {
    if (client?.connected) client.disconnect();
    return new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  });

  it("rejects connection without auth", () => {
    return new Promise<void>((resolve, reject) => {
      client = ioClient("http://localhost:3999", {
        autoConnect: true,
        reconnection: false,
      });

      client.on("connect_error", (err) => {
        expect(err.message).toContain("Authentication");
        client.disconnect();
        resolve();
      });

      client.on("connect", () => {
        client.disconnect();
        reject(new Error("Expected connection to be rejected"));
      });
    });
  });

  it("accepts connection with valid token", async () => {
    const { SignJWT } = await import("jose");
    process.env.NEXTAUTH_SECRET = "test-secret";
    const token = await new SignJWT({ userId: "test-user" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("test-secret"));

    return new Promise<void>((resolve, reject) => {
      const c = ioClient("http://localhost:3999", {
        auth: { token },
        reconnection: false,
      });

      c.on("connect", () => {
        c.disconnect();
        resolve();
      });

      c.on("connect_error", (err) => {
        c.disconnect();
        reject(err);
      });
    });
  });
});
