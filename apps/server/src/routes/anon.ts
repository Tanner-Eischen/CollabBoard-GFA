import express, { Router } from "express";
import { randomUUID } from "crypto";
import { redis } from "../lib/redis.js";

const router: express.Router = Router();

const CURSOR_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const ANON_SESSION_TTL = 24 * 60 * 60; // 24 hours

router.post("/anon/session", async (req, res) => {
  const { displayName, boardId } = req.body as {
    displayName?: string;
    boardId?: string;
  };

  if (!displayName || typeof displayName !== "string" || displayName.trim().length === 0) {
    res.status(400).json({ error: "displayName is required" });
    return;
  }
  if (!boardId || typeof boardId !== "string" || boardId.trim().length === 0) {
    res.status(400).json({ error: "boardId is required" });
    return;
  }

  const sessionId = randomUUID();
  const cursorColor =
    CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];

  const data = JSON.stringify({
    displayName: displayName.trim().slice(0, 64),
    cursorColor,
    boardId,
  });

  await redis.setex(
    `session:anon:${sessionId}`,
    ANON_SESSION_TTL,
    data
  );

  res.status(201).json({
    sessionId,
    displayName: displayName.trim().slice(0, 64),
    cursorColor,
    boardId,
    expiresIn: ANON_SESSION_TTL,
  });
});

export default router;
