import { describe, it, expect } from "vitest";
import request from "supertest";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";

describe("rate limiting", () => {
  it("returns 429 when limit exceeded", async () => {
    const limiter = rateLimit({
      windowMs: 60000,
      max: 2,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "TooManyRequests", message: "Too many requests" },
    });

    const app: Express = express();
    app.use(limiter);
    app.get("/", (_req, res) => res.json({ ok: true }));

    const agent = request.agent(app);
    await agent.get("/");
    await agent.get("/");
    const res = await agent.get("/");

    expect(res.status).toBe(429);
    expect(res.body).toMatchObject({
      error: "TooManyRequests",
      message: expect.stringContaining("Too many requests"),
    });
  });
});
