import { describe, expect, it, vi, beforeEach } from "vitest";
import * as BoardService from "../services/BoardService.js";

vi.mock("../repositories/BoardRepository.js", () => ({
  createBoard: vi.fn(),
  findBoardById: vi.fn(),
  findBoardByShareLink: vi.fn(),
  findBoardsByOwnerId: vi.fn(),
  updateBoard: vi.fn(),
  deleteBoard: vi.fn(),
  existsByShareLink: vi.fn(),
}));

describe("BoardService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isOwner", () => {
    it("returns true when userId matches ownerId", () => {
      const board = {
        id: "b1",
        name: "Test",
        shareLink: "abc123",
        ownerId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(BoardService.isOwner(board, "user-1")).toBe(true);
    });

    it("returns false when userId does not match ownerId", () => {
      const board = {
        id: "b1",
        name: "Test",
        shareLink: "abc123",
        ownerId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(BoardService.isOwner(board, "user-2")).toBe(false);
    });
  });

  describe("generateUniqueShareLink", () => {
    it("returns URL-safe alphanumeric string of expected length", async () => {
      const { existsByShareLink } = await import(
        "../repositories/BoardRepository.js"
      );
      vi.mocked(existsByShareLink).mockResolvedValue(false);

      const link = await BoardService.generateUniqueShareLink();
      expect(link).toMatch(/^[A-Za-z0-9]{12}$/);
      expect(link.length).toBe(12);
    });

    it("retries on collision", async () => {
      const { existsByShareLink } = await import(
        "../repositories/BoardRepository.js"
      );
      vi.mocked(existsByShareLink)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const link = await BoardService.generateUniqueShareLink();
      expect(existsByShareLink).toHaveBeenCalledTimes(3);
      expect(link).toMatch(/^[A-Za-z0-9]{12}$/);
    });
  });
});
