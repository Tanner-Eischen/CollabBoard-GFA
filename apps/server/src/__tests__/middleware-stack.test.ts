import { describe, it, expect } from "vitest";
import request from "supertest";
import express, { type Express } from "express";
import { errorHandler } from "../middleware/errorHandler.js";
import app from "../app.js";

describe("middleware stack integration", () => {
  it("health returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("POST /api/boards without auth returns 401", async () => {
    const res = await request(app).post("/api/boards").send({});
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: "Unauthorized" });
  });

  it("POST /api/boards with invalid body returns 400 with Zod error details", async () => {
    const res = await request(app)
      .post("/api/boards")
      .set("Authorization", "Bearer invalid-token")
      .send({ name: "" });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: expect.any(String),
      message: "Validation failed",
      details: expect.any(Object),
    });
  });

  it("error handler returns consistent JSON format", async () => {
    const testApp: Express = express();
    testApp.use(express.json());
    testApp.get("/fail", () => {
      const err = new Error("Test error") as import("../middleware/errorHandler.js").ApiError;
      err.statusCode = 400;
      throw err;
    });
    testApp.use(errorHandler);

    const res = await request(testApp).get("/fail");
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: expect.any(String),
      message: "Test error",
    });
  });
});
