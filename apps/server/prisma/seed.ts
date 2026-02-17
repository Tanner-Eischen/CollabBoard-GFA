/**
 * Prisma seed script - creates test data for development.
 * Run with: npx prisma db seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      provider: "google",
      providerId: "test-provider-id",
    },
  });

  const board = await prisma.board.upsert({
    where: { shareLink: "test-share-link" },
    update: {},
    create: {
      name: "Test Board",
      shareLink: "test-share-link",
      ownerId: user.id,
    },
  });

  await prisma.object.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      type: "sticky",
      data: { text: "Hello, CollabBoard!", color: "#ffeb3b" },
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      zIndex: 0,
      boardId: board.id,
    },
  });

  console.log("Seed completed:", { user: user.email, board: board.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
