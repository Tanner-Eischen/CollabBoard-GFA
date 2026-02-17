import { describe, expect, it } from "vitest";
import request from "supertest";
import { SignJWT } from "jose";
import app from "../app.js";

describe("auth middleware", () => {
  it("rejects request without Authorization header", async () => {
    const res = await request(app).get("/api/me");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("rejects request with invalid token", async () => {
    const res = await request(app)
      .get("/api/me")
      .set("Authorization", "Bearer invalid-token");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("accepts valid token and returns userId", async () => {
    process.env.NEXTAUTH_SECRET = "test-secret";
    const secret = new TextEncoder().encode("test-secret");
    const token = await new SignJWT({ userId: "user-456" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);

    const res = await request(app)
      .get("/api/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe("user-456");
  });
});
