import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { errorHandler } from "../middleware/errorHandler.js";

describe("error handler", () => {
  it("returns consistent JSON error format", async () => {
    const app = express();
    app.get("/boom", (_req, _res, next) => {
      const err = new Error("Something broke") as Error & {
        statusCode?: number;
        details?: unknown;
      };
      err.statusCode = 418;
      err.details = { reason: "teapot" };
      next(err);
    });
    app.use(errorHandler);

    const res = await request(app).get("/boom");
    expect(res.status).toBe(418);
    expect(res.body).toEqual({
      error: "Error",
      message: "Something broke",
      details: { reason: "teapot" },
    });
  });
});
