import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useBoards } from "../../hooks/useBoards";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

vi.mock("@/lib/api/boards", () => ({
  listBoards: vi.fn(),
  createBoard: vi.fn(),
  deleteBoard: vi.fn(),
}));

import { useSession } from "next-auth/react";
import * as boardsApi from "@/lib/api/boards";

describe("useBoards", () => {
  it("starts with loading when session loading", () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: "loading",
      update: vi.fn(),
    });

    const { result } = renderHook(() => useBoards());
    expect(result.current.state).toEqual({ status: "loading" });
  });

  it("fetches boards when session has token", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { id: "u1", email: "test@example.com" },
        apiToken: "token123",
        expires: "2099-01-01",
      },
      status: "authenticated",
      update: vi.fn(),
    });

    vi.mocked(boardsApi.listBoards).mockResolvedValue([]);

    const { result } = renderHook(() => useBoards());

    await waitFor(() => {
      expect(result.current.state.status).not.toBe("loading");
    });

    expect(result.current.state).toEqual({ status: "empty", boards: [] });
  });

  it("returns success state with boards", async () => {
    const boards = [
      {
        id: "b1",
        name: "Board 1",
        shareLink: "abc",
        ownerId: "u1",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
    ];

    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { id: "u1", email: "test@example.com" },
        apiToken: "token123",
        expires: "2099-01-01",
      },
      status: "authenticated",
      update: vi.fn(),
    });

    vi.mocked(boardsApi.listBoards).mockResolvedValue(boards);

    const { result } = renderHook(() => useBoards());

    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
    });

    expect(result.current.state).toEqual({ status: "success", boards });
  });
});
