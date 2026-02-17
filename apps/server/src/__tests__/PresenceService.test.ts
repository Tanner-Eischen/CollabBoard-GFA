import { describe, expect, it, beforeEach } from "vitest";
import { PresenceService } from "../services/PresenceService.js";

describe("PresenceService", () => {
  const boardId = "board-test-1";

  beforeEach(() => {
    // Clean up in-memory state between tests
    PresenceService.leaveBoard(boardId, "user-1");
    PresenceService.leaveBoard(boardId, "user-2");
  });

  it("joinBoard returns presence with fallback displayName", async () => {
    const presence = await PresenceService.joinBoard(boardId, "user-1");
    expect(presence.userId).toBe("user-1");
    expect(presence.displayName).toMatch(/user-1|User/);
    expect(presence.color).toBeDefined();
    expect(presence.color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("joinBoard uses provided displayName and color", async () => {
    const presence = await PresenceService.joinBoard(boardId, "user-1", {
      displayName: "Alice",
      color: "#ff0000",
    });
    expect(presence.displayName).toBe("Alice");
    expect(presence.color).toBe("#ff0000");
  });

  it("getUsers returns joined users", async () => {
    await PresenceService.joinBoard(boardId, "user-1", {
      displayName: "Alice",
      color: "#ff0000",
    });
    await PresenceService.joinBoard(boardId, "user-2", {
      displayName: "Bob",
      color: "#00ff00",
    });
    const users = PresenceService.getUsers(boardId);
    expect(users).toHaveLength(2);
    expect(users.map((u) => u.userId).sort()).toEqual(["user-1", "user-2"]);
  });

  it("leaveBoard removes user from roster", async () => {
    await PresenceService.joinBoard(boardId, "user-1", {
      displayName: "Alice",
      color: "#ff0000",
    });
    PresenceService.leaveBoard(boardId, "user-1");
    expect(PresenceService.getUsers(boardId)).toHaveLength(0);
  });

  it("getUser returns single user", async () => {
    await PresenceService.joinBoard(boardId, "user-1", {
      displayName: "Alice",
      color: "#ff0000",
    });
    const user = PresenceService.getUser(boardId, "user-1");
    expect(user?.displayName).toBe("Alice");
    expect(PresenceService.getUser(boardId, "user-2")).toBeUndefined();
  });
});
