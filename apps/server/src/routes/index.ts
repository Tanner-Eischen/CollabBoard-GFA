import { Router } from "express";
import boardsRouter from "./boards.js";
import objectsRouter from "./objects.js";

const router: Router = Router();

router.use("/boards", boardsRouter);
router.use("/objects", objectsRouter);

export default router;
