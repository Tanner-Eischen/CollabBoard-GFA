import express, { Router } from "express";
import boardsRouter from "./boards.js";
import objectsRouter from "./objects.js";

const router: express.Router = Router();

router.use("/boards", boardsRouter);
router.use("/objects", objectsRouter);

export default router;
