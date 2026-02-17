import app from "./app.js";
import { createServer } from "http";
import { verifyPrismaConnection } from "./lib/prisma.js";
import { verifyRedisConnection } from "./lib/redis.js";
import { createSocketServer } from "./socket/index.js";

const PORT = process.env.PORT || 3001;

async function start(): Promise<void> {
  try {
    await verifyPrismaConnection();
    await verifyRedisConnection();

    const httpServer = createServer(app);
    createSocketServer(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup connectivity check failed", error);
    process.exit(1);
  }
}

void start();
