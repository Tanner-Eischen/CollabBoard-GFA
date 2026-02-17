import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BoardList } from "../../../components/dashboard/BoardList";
import type { BoardsState } from "../../../hooks/useBoards";
import { ToastProvider } from "../../../components/ui/Toast";

function renderWithToast(ui: ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

const mockBoard = {
  id: "b1",
  name: "Test Board",
  shareLink: "abc123",
  ownerId: "u1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

describe("BoardList", () => {
  it("shows loading spinner when loading", () => {
    const state: BoardsState = { status: "loading" };
    render(<BoardList state={state} onDelete={vi.fn()} />);
    expect(screen.getByRole("status", { name: /loading boards/i })).toBeInTheDocument();
  });

  it("shows error message when error", () => {
    const state: BoardsState = {
      status: "error",
      error: "Network error",
    };
    render(<BoardList state={state} onDelete={vi.fn()} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/failed to load boards/i)).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("shows empty state when no boards", () => {
    const state: BoardsState = { status: "empty", boards: [] };
    render(<BoardList state={state} onDelete={vi.fn()} />);
    expect(screen.getByText(/no boards yet/i)).toBeInTheDocument();
    expect(screen.getByText(/create your first board/i)).toBeInTheDocument();
  });

  it("renders board cards when success", () => {
    const state: BoardsState = {
      status: "success",
      boards: [mockBoard],
    };
    renderWithToast(<BoardList state={state} onDelete={vi.fn()} />);
    expect(screen.getByText("Test Board")).toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();
  });
});
