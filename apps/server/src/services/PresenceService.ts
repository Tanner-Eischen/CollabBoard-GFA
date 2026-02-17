import type { UserPresence } from "@collabboard/shared";
import { prisma } from "../lib/prisma.js";

const PRESENCE_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

function colorFromUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  return PRESENCE_COLORS[Math.abs(hash) % PRESENCE_COLORS.length];
}

/** In-memory presence per board. For multi-server scale, replace with Redis. */
const boardPresence = new Map<string, Map<string, UserPresence>>();

export const PresenceService = {
  async joinBoard(
    boardId: string,
    userId: string,
    options?: { displayName?: string; color?: string }
  ): Promise<UserPresence> {
    let displayName = options?.displayName;
    let avatarUrl: string | null = null;

    if (process.env.DATABASE_URL) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, avatarUrl: true },
        });
        if (user) {
          displayName ??= user.name;
          avatarUrl = user.avatarUrl;
        }
      } catch {
        // DB error; use fallbacks
      }
    }
    displayName ??= `User ${userId.slice(0, 8)}`;
    const color = options?.color ?? colorFromUserId(userId);

    const presence: UserPresence = {
      userId,
      displayName,
      color,
      avatarUrl: avatarUrl ?? undefined,
    };

    let users = boardPresence.get(boardId);
    if (!users) {
      users = new Map();
      boardPresence.set(boardId, users);
    }
    users.set(userId, presence);
    return presence;
  },

  leaveBoard(boardId: string, userId: string): void {
    const users = boardPresence.get(boardId);
    if (users) {
      users.delete(userId);
      if (users.size === 0) {
        boardPresence.delete(boardId);
      }
    }
  },

  getUsers(boardId: string): UserPresence[] {
    const users = boardPresence.get(boardId);
    return users ? Array.from(users.values()) : [];
  },

  getUser(boardId: string, userId: string): UserPresence | undefined {
    return boardPresence.get(boardId)?.get(userId);
  },
};
