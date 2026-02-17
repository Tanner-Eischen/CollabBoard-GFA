import { Router } from "express";
import {
  createBoardSchema,
  updateBoardSchema,
  boardIdParamSchema,
  shareLinkParamSchema,
} from "../lib/validators/board.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import * as BoardService from "../services/BoardService.js";

const router: Router = Router();

function toBoardJson(board: {
  id: string;
  name: string;
  shareLink: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: board.id,
    name: board.name,
    shareLink: board.shareLink,
    ownerId: board.ownerId,
    createdAt: board.createdAt.toISOString(),
    updatedAt: board.updatedAt.toISOString(),
  };
}

// POST /api/boards - create board (auth required)
router.post(
  "/",
  validateBody(createBoardSchema),
  authMiddleware,
  async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { name } = req.body as { name?: string };
      const board = await BoardService.createBoard(userId, name ?? "Untitled Board");
      res.status(201).json(toBoardJson(board));
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/boards - list user's boards (auth required)
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).userId!;
    const boards = await BoardService.listBoardsByOwner(userId);
    res.json(boards.map(toBoardJson));
  } catch (err) {
    next(err);
  }
});

// GET /api/boards/share/:shareLink - get board by share link (public)
router.get(
  "/share/:shareLink",
  validateParams(shareLinkParamSchema),
  async (req, res, next) => {
    try {
      const shareLink = String(req.params.shareLink ?? "");
      const board = await BoardService.getBoardByShareLink(shareLink);
      if (!board) {
        res.status(404).json({ error: "Not Found", message: "Board not found" });
        return;
      }
      res.json(toBoardJson(board));
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/boards/:id - get board by id (owner only)
router.get(
  "/:id",
  validateParams(boardIdParamSchema),
  authMiddleware,
  async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const id = String(req.params.id ?? "");
      const board = await BoardService.getBoardById(id);
      if (!board) {
        res.status(404).json({ error: "Not Found", message: "Board not found" });
        return;
      }
      if (!BoardService.isOwner(board, userId)) {
        res.status(403).json({ error: "Forbidden", message: "Not board owner" });
        return;
      }
      res.json(toBoardJson(board));
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/boards/:id - update board (owner only)
router.patch(
  "/:id",
  validateParams(boardIdParamSchema),
  validateBody(updateBoardSchema),
  authMiddleware,
  async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const id = String(req.params.id ?? "");
      const { name } = req.body as { name: string };
      const board = await BoardService.updateBoard(id, userId, { name });
      if (!board) {
        res.status(404).json({ error: "Not Found", message: "Board not found" });
        return;
      }
      res.json(toBoardJson(board));
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/boards/:id - delete board (owner only)
router.delete(
  "/:id",
  validateParams(boardIdParamSchema),
  authMiddleware,
  async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const id = String(req.params.id ?? "");
      const deleted = await BoardService.deleteBoard(id, userId);
      if (!deleted) {
        res.status(404).json({ error: "Not Found", message: "Board not found" });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
