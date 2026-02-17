import app from "./app.js";
import { verifyPrismaConnection } from "./lib/prisma.js";
import { verifyRedisConnection } from "./lib/redis.js";

const PORT = process.env.PORT || 3001;

async function start(): Promise<void> {
  try {
    await verifyPrismaConnection();
    await verifyRedisConnection();

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup connectivity check failed", error);
    process.exit(1);
  }
}

void start();
