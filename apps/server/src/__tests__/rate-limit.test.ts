import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { apiRateLimiter } from "../middleware/rateLimit.js";

describe("api rate limiter", () => {
  it("returns 429 when request limit is exceeded", async () => {
    const app = express();
    app.use("/api", apiRateLimiter);
    app.get("/api/ping", (_req, res) => {
      res.status(200).json({ ok: true });
    });

    let lastStatus = 200;
    for (let i = 0; i < 101; i += 1) {
      const res = await request(app).get("/api/ping");
      lastStatus = res.status;
    }

    expect(lastStatus).toBe(429);
  });
});
