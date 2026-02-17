import type { Request, Response, NextFunction } from "express";
import type { z } from "zod";
import { ApiError } from "./errorHandler.js";

export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (result.success) {
      req.body = result.data;
      next();
    } else {
      const err = new Error("Validation failed") as ApiError;
      err.statusCode = 400;
      err.details = result.error.flatten();
      next(err);
    }
  };
}

export function validateParams<T extends z.ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (result.success) {
      req.params = result.data as Record<string, string>;
      next();
    } else {
      const err = new Error("Validation failed") as ApiError;
      err.statusCode = 400;
      err.details = result.error.flatten();
      next(err);
    }
  };
}
