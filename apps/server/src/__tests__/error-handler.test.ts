import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";
import { errorHandler, type ApiError } from "../middleware/errorHandler.js";

function mockReq(): Request {
  return {} as Request;
}

function mockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("errorHandler", () => {
  it("returns 500 and message for generic Error", () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();
    const err = new Error("Something broke") as ApiError;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Error",
        message: "Something broke",
      })
    );
  });

  it("returns statusCode and details when provided", () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();
    const err = new Error("Validation failed") as ApiError;
    err.statusCode = 400;
    err.details = { fieldErrors: { name: ["Required"] } };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Error",
        message: "Validation failed",
        details: { fieldErrors: { name: ["Required"] } },
      })
    );
  });
});
