import rateLimit from "express-rate-limit";

const windowMs = 15 * 60 * 1000;
const max = 100;

export const apiRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "TooManyRequests",
    message: "Too many requests, please try again later.",
  },
});
