import { SignJWT } from "jose";
import { createServer } from "http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { io as ioClient, type Socket as ClientSocket } from "socket.io-client";
import app from "../app.js";
import { createSocketServer } from "../socket/index.js";

describe("socket presence and cursor", () => {
  let httpServer: ReturnType<typeof createServer>;
  let client1: ClientSocket | null = null;
  let client2: ClientSocket | null = null;
  let port = 0;
  let savedDb: string | undefined;

  async function createToken(userId: string) {
    return new SignJWT({ userId })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("test-secret"));
  }

  beforeEach(async () => {
    process.env.NEXTAUTH_SECRET = "test-secret";
    savedDb = process.env.DATABASE_URL;
    process.env.DATABASE_URL = ""; // skip DB calls in socket tests (PresenceService, ObjectService)
    httpServer = createServer(app);
    const io = createSocketServer(httpServer);
    app.set("io", io);

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
    if (client1) {
      client1.disconnect();
      client1 = null;
    }
    if (client2) {
      client2.disconnect();
      client2 = null;
    }
    await new Promise<void>((resolve, reject) => {
      httpServer.close((err) => (err ? reject(err) : resolve()));
    });
    if (typeof savedDb !== "undefined") process.env.DATABASE_URL = savedDb;
  });

  it("board:join emits user:joined and users:list", async () => {
    const token = await createToken("user-1");
    client1 = ioClient(`http://localhost:${port}`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: false,
    });

    await new Promise<void>((resolve, reject) => {
      client1?.on("connect", () => resolve());
      client1?.on("connect_error", (err) => reject(err));
    });

    const usersListPromise = new Promise<{ users: unknown[] }>((resolve) => {
      client1?.on("users:list", (payload) => resolve(payload));
    });

    client1.emit("board:join", { boardId: "board-1", displayName: "Alice" });

    const { users } = await usersListPromise;
    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({
      userId: "user-1",
      displayName: "Alice",
    });
  });

  it("first user receives user:joined when second joins", async () => {
    const token1 = await createToken("user-1");
    const token2 = await createToken("user-2");

    client1 = ioClient(`http://localhost:${port}`, {
      auth: { token: token1 },
      transports: ["websocket"],
      reconnection: false,
    });
    client2 = ioClient(`http://localhost:${port}`, {
      auth: { token: token2 },
      transports: ["websocket"],
      reconnection: false,
    });

    await Promise.all([
      new Promise<void>((resolve) => client1?.on("connect", () => resolve())),
      new Promise<void>((resolve) => client2?.on("connect", () => resolve())),
    ]);

    client1.emit("board:join", { boardId: "board-1", displayName: "Alice" });

    const userJoinedPromise = new Promise<{ user: { userId: string; displayName: string } }>(
      (resolve) => {
        client1?.on("user:joined", (payload) => resolve(payload));
      }
    );

    client2.emit("board:join", { boardId: "board-1", displayName: "Bob" });

    const { user } = await userJoinedPromise;
    expect(user.userId).toBe("user-2");
    expect(user.displayName).toBe("Bob");
  });

  it("cursor:move broadcasts cursor:update to other users in room", async () => {
    const token1 = await createToken("user-1");
    const token2 = await createToken("user-2");

    client1 = ioClient(`http://localhost:${port}`, {
      auth: { token: token1 },
      transports: ["websocket"],
      reconnection: false,
    });
    client2 = ioClient(`http://localhost:${port}`, {
      auth: { token: token2 },
      transports: ["websocket"],
      reconnection: false,
    });

    await Promise.all([
      new Promise<void>((resolve) => client1?.on("connect", () => resolve())),
      new Promise<void>((resolve) => client2?.on("connect", () => resolve())),
    ]);

    const client2Joined = new Promise<void>((resolve) =>
      client2?.on("users:list", () => resolve())
    );

    client1.emit("board:join", { boardId: "board-1", displayName: "Alice" });
    client2.emit("board:join", { boardId: "board-1", displayName: "Bob" });
    await client2Joined;

    const cursorUpdatePromise = new Promise<{
      userId: string;
      x: number;
      y: number;
      displayName: string;
    }>((resolve) => {
      client2?.on("cursor:update", (payload) => resolve(payload));
    });

    client1.emit("cursor:move", {
      boardId: "board-1",
      x: 100,
      y: 200,
    });

    const update = await cursorUpdatePromise;
    expect(update.userId).toBe("user-1");
    expect(update.x).toBe(100);
    expect(update.y).toBe(200);
    expect(update.displayName).toBe("Alice");
  });

  it("board:join emits objects:list with initial state", async () => {
    const token = await createToken("user-1");
    client1 = ioClient(`http://localhost:${port}`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: false,
    });

    await new Promise<void>((resolve, reject) => {
      client1?.on("connect", () => resolve());
      client1?.on("connect_error", (err) => reject(err));
    });

    const objectsListPromise = new Promise<{
      objects: unknown[];
      boardId: string;
      timestamp: string;
    }>((resolve) => {
      client1?.on("objects:list", (payload) => resolve(payload));
    });

    client1.emit("board:join", { boardId: "board-1", displayName: "Alice" });

    const payload = await objectsListPromise;
    expect(payload.boardId).toBe("board-1");
    expect(Array.isArray(payload.objects)).toBe(true);
    expect(typeof payload.timestamp).toBe("string");
  });
});
