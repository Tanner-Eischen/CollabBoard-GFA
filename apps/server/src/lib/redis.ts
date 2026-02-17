// eslint-disable-next-line @typescript-eslint/no-require-imports
const Redis = require("ioredis");

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    if (times > 3) return null;
    return Math.min(times * 100, 3000);
  },
});

export async function verifyRedisConnection(): Promise<void> {
  await redis.ping();
  console.log("Connected to Redis");
}
