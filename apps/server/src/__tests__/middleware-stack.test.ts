import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("middleware stack", () => {
  it("allows configured frontend origin via CORS", async () => {
    const res = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:3000");

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000"
    );
  });

  it("returns 400 for invalid request body with validation details", async () => {
    const res = await request(app).post("/api/boards").send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(res.body.details).toBeDefined();
  });

  it("returns 401 for protected route without token", async () => {
    const res = await request(app).get("/api/boards");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });
});
