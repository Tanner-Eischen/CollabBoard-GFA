import cors from 'cors';
import express, { type Express } from 'express';

const app: Express = express();

const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000'].filter(
  (origin): origin is string => Boolean(origin && origin.trim())
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header (health checks, server-to-server calls).
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;
