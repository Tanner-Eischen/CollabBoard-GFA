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

describe("objects API integration", () => {
  let testUserId: string;
  let otherUserId: string;
  let authToken: string;
  let createdBoardId: string;
  let createdObjectId: string;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) return;

    process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "test-secret";

    const [user, other] = await Promise.all([
      prisma.user.upsert({
        where: { email: "object-test@example.com" },
        update: {},
        create: {
          email: "object-test@example.com",
          name: "Object Test User",
          provider: "google",
          providerId: "object-test-provider",
        },
      }),
      prisma.user.upsert({
        where: { email: "object-other@example.com" },
        update: {},
        create: {
          email: "object-other@example.com",
          name: "Other User",
          provider: "google",
          providerId: "object-other-provider",
        },
      }),
    ]);

    testUserId = user.id;
    otherUserId = other.id;
    authToken = await createToken(testUserId);

    const board = await prisma.board.create({
      data: {
        name: "Object Test Board",
        shareLink: "objtest123",
        ownerId: testUserId,
      },
    });
    createdBoardId = board.id;
  });

  afterAll(async () => {
    if (createdObjectId) {
      await prisma.object.deleteMany({ where: { id: createdObjectId } });
    }
    if (createdBoardId) {
      await prisma.object.deleteMany({ where: { boardId: createdBoardId } });
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
    "POST /api/objects creates object",
    async () => {
      const res = await request(app)
        .post("/api/objects")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          boardId: createdBoardId,
          type: "sticky",
          x: 10,
          y: 20,
          width: 100,
          height: 50,
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.type).toBe("sticky");
      expect(res.body.x).toBe(10);
      expect(res.body.y).toBe(20);
      expect(res.body.boardId).toBe(createdBoardId);

      createdObjectId = res.body.id;
    }
  );

  it.skipIf(!process.env.DATABASE_URL)(
    "GET /api/objects?boardId=xxx returns objects for owner",
    async () => {
      if (!createdBoardId) return;
      const res = await request(app)
        .get(`/api/objects?boardId=${createdBoardId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const obj = res.body.find((o: { id: string }) => o.id === createdObjectId);
      expect(obj).toBeDefined();
    }
  );

  it.skipIf(!process.env.DATABASE_URL)(
    "GET /api/objects/:id returns object for owner",
    async () => {
      if (!createdObjectId) return;
      const res = await request(app)
        .get(`/api/objects/${createdObjectId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdObjectId);
    }
  );

  it.skipIf(!process.env.DATABASE_URL)(
    "PATCH /api/objects/:id updates object",
    async () => {
      if (!createdObjectId) return;
      const res = await request(app)
        .patch(`/api/objects/${createdObjectId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ x: 30, y: 40 });

      expect(res.status).toBe(200);
      expect(res.body.x).toBe(30);
      expect(res.body.y).toBe(40);
    }
  );

  it.skipIf(!process.env.DATABASE_URL)(
    "POST /api/objects/batch creates multiple objects",
    async () => {
      if (!createdBoardId) return;
      const res = await request(app)
        .post("/api/objects/batch")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          objects: [
            { boardId: createdBoardId, type: "rectangle", x: 0, y: 0 },
            { boardId: createdBoardId, type: "circle", x: 50, y: 50 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveLength(2);
    }
  );

  it.skipIf(!process.env.DATABASE_URL)(
    "DELETE /api/objects/:id removes object",
    async () => {
      if (!createdObjectId) return;
      const res = await request(app)
        .delete(`/api/objects/${createdObjectId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(204);
    }
  );

  it("returns 401 for protected routes without token", async () => {
    const res = await request(app).get("/api/objects?boardId=00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(401);
  });
});
