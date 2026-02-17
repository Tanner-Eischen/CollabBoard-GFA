import cors from "cors";
import express, { type Express } from "express";
import type { AuthenticatedRequest } from "./middleware/auth.js";
import { authMiddleware } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRateLimiter } from "./middleware/rateLimit.js";
import anonRouter from "./routes/anon.js";
import apiRouter from "./routes/index.js";

const app: Express = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
].filter((origin): origin is string => Boolean(origin && origin.trim()));

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use("/api", apiRateLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", anonRouter);
app.use("/api", apiRouter);

app.get("/api/me", authMiddleware, (req, res) => {
  res.json({ userId: (req as AuthenticatedRequest).userId });
});

app.use(errorHandler);

export default app;
