import { SignJWT } from "jose";
import { createServer } from "http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { io as ioClient, type Socket as ClientSocket } from "socket.io-client";
import app from "../app.js";
import { createSocketServer } from "../socket/index.js";

describe("socket connection lifecycle", () => {
  let httpServer: ReturnType<typeof createServer>;
  let client: ClientSocket | null = null;
  let port = 0;

  beforeEach(async () => {
    process.env.NEXTAUTH_SECRET = "test-secret";
    httpServer = createServer(app);
    createSocketServer(httpServer);

    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        port = Number(
          (httpServer.address() as { port: number } | null)?.port ?? 0
        );
        resolve();
      });
    });
  });

  afterEach(async () => {
    if (client) {
      client.disconnect();
      client = null;
    }
    await new Promise<void>((resolve, reject) => {
      httpServer.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("accepts connection with valid token", async () => {
    const token = await new SignJWT({ userId: "test-user" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("test-secret"));

    client = ioClient(`http://localhost:${port}`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: false,
    });

    await new Promise<void>((resolve, reject) => {
      client?.on("connect", () => resolve());
      client?.on("connect_error", (err) => reject(err));
    });

    expect(client.connected).toBe(true);
  });
});
