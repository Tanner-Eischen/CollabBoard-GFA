import express, { Router } from "express";
import { createBoardSchema } from "../lib/validators/board.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

const router: express.Router = Router();

router.post("/", validateBody(createBoardSchema), authMiddleware, (_req, res) => {
  res.status(201).json({ id: "stub", name: "Untitled Board" });
});

router.get("/", authMiddleware, (_req, res) => {
  res.json([]);
});

export default router;
