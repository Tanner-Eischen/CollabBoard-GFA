import { describe, expect, it, vi, beforeEach } from "vitest";
import * as ObjectService from "../services/ObjectService.js";

vi.mock("../repositories/ObjectRepository.js", () => ({
  createObject: vi.fn(),
  findObjectById: vi.fn(),
  findObjectsByBoardId: vi.fn(),
  updateObject: vi.fn(),
  deleteObject: vi.fn(),
  createObjects: vi.fn(),
  deleteObjects: vi.fn(),
}));

vi.mock("../services/BoardService.js", () => ({
  getBoardById: vi.fn(),
  isOwner: vi.fn(),
}));

describe("ObjectService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBoard = {
    id: "board-1",
    name: "Test",
    shareLink: "abc123",
    ownerId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockObject = {
    id: "obj-1",
    type: "sticky",
    data: {},
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    zIndex: 0,
    boardId: "board-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("createObject", () => {
    it("returns null when board not found", async () => {
      const { getBoardById } = await import("../services/BoardService.js");
      vi.mocked(getBoardById).mockResolvedValue(null);

      const result = await ObjectService.createObject("user-1", {
        boardId: "board-1",
        type: "sticky",
        x: 0,
        y: 0,
      });
      expect(result).toBeNull();
    });

    it("returns null when user is not owner", async () => {
      const { getBoardById, isOwner } = await import("../services/BoardService.js");
      vi.mocked(getBoardById).mockResolvedValue(mockBoard);
      vi.mocked(isOwner).mockReturnValue(false);

      const result = await ObjectService.createObject("user-2", {
        boardId: "board-1",
        type: "sticky",
        x: 0,
        y: 0,
      });
      expect(result).toBeNull();
    });

    it("creates object when user is owner", async () => {
      const { getBoardById, isOwner } = await import("../services/BoardService.js");
      const { createObject } = await import("../repositories/ObjectRepository.js");
      vi.mocked(getBoardById).mockResolvedValue(mockBoard);
      vi.mocked(isOwner).mockReturnValue(true);
      vi.mocked(createObject).mockResolvedValue(mockObject);

      const result = await ObjectService.createObject("user-1", {
        boardId: "board-1",
        type: "sticky",
        x: 0,
        y: 0,
      });
      expect(result).toEqual(mockObject);
      expect(createObject).toHaveBeenCalledOnce();
    });
  });

  describe("getObjectById", () => {
    it("returns null when object not found", async () => {
      const { findObjectById } = await import("../repositories/ObjectRepository.js");
      vi.mocked(findObjectById).mockResolvedValue(null);

      const result = await ObjectService.getObjectById("user-1", "obj-1");
      expect(result).toBeNull();
    });

    it("returns null when user is not board owner", async () => {
      const { findObjectById } = await import("../repositories/ObjectRepository.js");
      const { getBoardById, isOwner } = await import("../services/BoardService.js");
      vi.mocked(findObjectById).mockResolvedValue(mockObject);
      vi.mocked(getBoardById).mockResolvedValue(mockBoard);
      vi.mocked(isOwner).mockReturnValue(false);

      const result = await ObjectService.getObjectById("user-2", "obj-1");
      expect(result).toBeNull();
    });

    it("returns object when user is owner", async () => {
      const { findObjectById } = await import("../repositories/ObjectRepository.js");
      const { getBoardById, isOwner } = await import("../services/BoardService.js");
      vi.mocked(findObjectById).mockResolvedValue(mockObject);
      vi.mocked(getBoardById).mockResolvedValue(mockBoard);
      vi.mocked(isOwner).mockReturnValue(true);

      const result = await ObjectService.getObjectById("user-1", "obj-1");
      expect(result).toEqual(mockObject);
    });
  });

  describe("createObjectsBatch", () => {
    it("returns empty array when inputs empty", async () => {
      const result = await ObjectService.createObjectsBatch("user-1", []);
      expect(result).toEqual([]);
    });

    it("returns empty when boardIds differ", async () => {
      const result = await ObjectService.createObjectsBatch("user-1", [
        { boardId: "board-1", type: "sticky", x: 0, y: 0 },
        { boardId: "board-2", type: "sticky", x: 0, y: 0 },
      ]);
      expect(result).toEqual([]);
    });

    it("returns empty when user is not owner", async () => {
      const { getBoardById, isOwner } = await import("../services/BoardService.js");
      vi.mocked(getBoardById).mockResolvedValue(mockBoard);
      vi.mocked(isOwner).mockReturnValue(false);

      const result = await ObjectService.createObjectsBatch("user-2", [
        { boardId: "board-1", type: "sticky", x: 0, y: 0 },
      ]);
      expect(result).toEqual([]);
    });
  });
});
