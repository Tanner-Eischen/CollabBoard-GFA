import type { Server } from "socket.io";
import { Router } from "express";
import {
  createObjectSchema,
  updateObjectSchema,
  objectIdParamSchema,
  boardIdQuerySchema,
  batchCreateObjectSchema,
  batchUpdateObjectSchema,
  batchDeleteObjectSchema,
} from "../lib/validators/object.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import * as ObjectService from "../services/ObjectService.js";
import * as SyncService from "../services/SyncService.js";

const router: Router = Router();

function getIo(req: { app: { get(name: string): unknown } }): Server | undefined {
  return req.app.get("io") as Server | undefined;
}

// POST /api/objects/batch - batch create (auth required) - must be before /:id
router.post(
  "/batch",
  authMiddleware,
  validateBody(batchCreateObjectSchema),
  async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { objects } = req.body as { objects: Array<{
        boardId: string;
        type: string;
        data?: unknown;
        x: number;
        y: number;
        width?: number | null;
        height?: number | null;
        rotation?: number;
        zIndex?: number;
      }> };
      const created = await ObjectService.createObjectsBatch(userId, objects);
      const io = getIo(req);
      for (const obj of created) {
        if (obj && io) SyncService.broadcastObjectCreated(io, obj.boardId, obj);
      }
      res.status(201).json(created.map((o) => SyncService.toObjectJson(o)));
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/objects/batch - batch update (auth required)
router.patch(
  "/batch",
  authMiddleware,
  validateBody(batchUpdateObjectSchema),
  async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { updates } = req.body as { updates: Array<{ id: string; data: Record<string, unknown> }> };
      const io = getIo(req);
      const results: Array<{ id: string; object?: ReturnType<typeof SyncService.toObjectJson> }> = [];
      for (const { id, data } of updates) {
        const obj = await ObjectService.updateObject(userId, id, data);
        if (obj && io) SyncService.broadcastObjectUpdated(io, obj.boardId, obj);
        results.push({ id, object: obj ? SyncService.toObjectJson(obj) : undefined });
      }
      res.json(results);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/objects/batch - batch delete (auth required)
router.delete(
  "/batch",
  authMiddleware,
  validateBody(batchDeleteObjectSchema),
  async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { ids } = req.body as { ids: string[] };
      const io = getIo(req);
      const objs = await Promise.all(ids.map((id) => ObjectService.getObjectById(userId, id)));
      const deleted = await ObjectService.deleteObjectsBatch(userId, ids);
      if (io && deleted > 0) {
        for (const obj of objs) {
          if (obj) SyncService.broadcastObjectDeleted(io, obj.boardId, obj.id);
        }
      }
      res.json({ deleted });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/objects - create object (auth required)
router.post(
  "/",
  authMiddleware,
  validateBody(createObjectSchema),
  async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const body = req.body as {
        boardId: string;
        type: string;
        data?: unknown;
        x: number;
        y: number;
        width?: number | null;
        height?: number | null;
        rotation?: number;
        zIndex?: number;
      };
      const obj = await ObjectService.createObject(userId, body);
      if (!obj) {
        res.status(404).json({ error: "Not Found", message: "Board not found or access denied" });
        return;
      }
      const io = getIo(req);
      if (io) SyncService.broadcastObjectCreated(io, obj.boardId, obj);
      res.status(201).json(SyncService.toObjectJson(obj));
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/objects?boardId=xxx - list objects by board (auth required)
router.get(
  "/",
  authMiddleware,
  validateQuery(boardIdQuerySchema),
  async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const boardId = String(req.query.boardId ?? "");
      const objects = await ObjectService.listObjectsByBoardId(userId, boardId);
      res.json(objects.map((o) => SyncService.toObjectJson(o)));
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/objects/:id - get object by id (auth required)
router.get(
  "/:id",
  validateParams(objectIdParamSchema),
  authMiddleware,
  async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const id = String(req.params.id ?? "");
      const obj = await ObjectService.getObjectById(userId, id);
      if (!obj) {
        res.status(404).json({ error: "Not Found", message: "Object not found" });
        return;
      }
      res.json(SyncService.toObjectJson(obj));
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/objects/:id - update object (auth required)
router.patch(
  "/:id",
  validateParams(objectIdParamSchema),
  validateBody(updateObjectSchema),
  authMiddleware,
  async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const id = String(req.params.id ?? "");
      const data = req.body as {
        type?: string;
        data?: unknown;
        x?: number;
        y?: number;
        width?: number | null;
        height?: number | null;
        rotation?: number;
        zIndex?: number;
      };
      const obj = await ObjectService.updateObject(userId, id, data);
      if (!obj) {
        res.status(404).json({ error: "Not Found", message: "Object not found" });
        return;
      }
      const io = getIo(req);
      if (io) SyncService.broadcastObjectUpdated(io, obj.boardId, obj);
      res.json(SyncService.toObjectJson(obj));
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/objects/:id - delete object (auth required)
router.delete(
  "/:id",
  validateParams(objectIdParamSchema),
  authMiddleware,
  async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const id = String(req.params.id ?? "");
      const obj = await ObjectService.getObjectById(userId, id);
      const deleted = await ObjectService.deleteObject(userId, id);
      if (!deleted) {
        res.status(404).json({ error: "Not Found", message: "Object not found" });
        return;
      }
      const io = getIo(req);
      if (io && obj) SyncService.broadcastObjectDeleted(io, obj.boardId, id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
