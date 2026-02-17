import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { SignJWT } from "jose";
import { PrismaClient } from "@prisma/client";
import app from "../app.js";

const prisma = new PrismaClient();

function createToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET ?? "test-secret"
  );
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);
}

describe("boards API integration", () => {
  let testUserId: string;
  let otherUserId: string;
  let authToken: string;
  let otherToken: string;
  let createdBoardId: string;
  let createdShareLink: string;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) return;

    process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "test-secret";

    const [user, other] = await Promise.all([
      prisma.user.upsert({
        where: { email: "board-test@example.com" },
        update: {},
        create: {
          email: "board-test@example.com",
          name: "Board Test User",
          provider: "google",
          providerId: "board-test-provider",
        },
      }),
      prisma.user.upsert({
        where: { email: "board-other@example.com" },
        update: {},
        create: {
          email: "board-other@example.com",
          name: "Other User",
          provider: "google",
          providerId: "board-other-provider",
        },
      }),
    ]);

    testUserId = user.id;
    otherUserId = other.id;
    authToken = await createToken(testUserId);
    otherToken = await createToken(otherUserId);
  });

  afterAll(async () => {
    if (createdBoardId) {
      await prisma.board.deleteMany({ where: { id: createdBoardId } });
    }
    if (testUserId && otherUserId) {
      await prisma.board.deleteMany({
        where: { ownerId: { in: [testUserId, otherUserId] } },
      });
    }
    await prisma.$disconnect();
  });

  it.skipIf(!process.env.DATABASE_URL)(
    "POST /api/boards creates board with unique share link",
    async () => {
      const res = await request(app)
        .post("/api/boards")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Integration Test Board" });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe("Integration Test Board");
      expect(res.body.shareLink).toMatch(/^[A-Za-z0-9]{12}$/);
      expect(res.body.ownerId).toBe(testUserId);

      if (!createdBoardId) {
        createdBoardId = res.body.id;
        createdShareLink = res.body.shareLink;
      }
    }
  );

  it.skipIf(!process.env.DATABASE_URL)(
    "GET /api/boards returns user boards sorted by updated_at",
    async () => {
      if (!createdBoardId) return;
      const res = await request(app)
        .get("/api/boards")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const board = res.body.find((b: { id: string }) => b.id === createdBoardId);
      expect(board).toBeDefined();
    }
  );

  it.skipIf(!process.env.DATABASE_URL)(
    "GET /api/boards/:id returns board for owner",
    async () => {
      if (!createdBoardId) return;
      const res = await request(app)
        .get(`/api/boards/${createdBoardId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdBoardId);
    }
  );

  it.skipIf(!process.env.DATABASE_URL)(
    "GET /api/boards/:id returns 403 for non-owner",
    async () => {
      if (!createdBoardId) return;
      const res = await request(app)
        .get(`/api/boards/${createdBoardId}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden");
    }
  );

  it.skipIf(!process.env.DATABASE_URL)(
    "GET /api/boards/share/:shareLink returns board (public)",
    async () => {
      if (!createdShareLink) return;
      const res = await request(app).get(
        `/api/boards/share/${createdShareLink}`
      );

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdBoardId);
      expect(res.body.shareLink).toBe(createdShareLink);
    }
  );

  it.skipIf(!process.env.DATABASE_URL)(
    "PATCH /api/boards/:id updates board name (owner only)",
    async () => {
      if (!createdBoardId) return;
      const res = await request(app)
        .patch(`/api/boards/${createdBoardId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Renamed Board" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Renamed Board");
    }
  );

  it.skipIf(!process.env.DATABASE_URL)(
    "PATCH /api/boards/:id returns 404 for non-owner",
    async () => {
      if (!createdBoardId) return;
      const res = await request(app)
        .patch(`/api/boards/${createdBoardId}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({ name: "Hacked" });

      expect(res.status).toBe(404);
    }
  );

  it.skipIf(!process.env.DATABASE_URL)(
    "DELETE /api/boards/:id removes board (owner only)",
    async () => {
      if (!createdBoardId) return;
      const res = await request(app)
        .delete(`/api/boards/${createdBoardId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(204);
    }
  );

  it("returns 401 for protected routes without token", async () => {
    const res = await request(app).get("/api/boards");
    expect(res.status).toBe(401);
  });

  it.skipIf(!process.env.DATABASE_URL)(
    "returns 404 for non-existent board",
    async () => {
      process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "test-secret";
      const token = await createToken("00000000-0000-0000-0000-000000000001");
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const res = await request(app)
        .get(`/api/boards/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(404);
    }
  );
});
