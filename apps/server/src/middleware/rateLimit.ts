import rateLimit from "express-rate-limit";

const windowMs = 15 * 60 * 1000; // 15 minutes
const max = 100; // requests per window

export const apiRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TooManyRequests", message: "Too many requests, please try again later." },
});
