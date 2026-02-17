import express, { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { createObjectSchema } from "../lib/validators/object.js";

const router: express.Router = Router();

router.post("/", authMiddleware, validateBody(createObjectSchema), (_req, res) => {
  res.status(201).json({ id: "stub" });
});

export default router;
