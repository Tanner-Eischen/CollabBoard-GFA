import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DeleteBoardModal } from "../../../components/dashboard/DeleteBoardModal";

const mockBoard = {
  id: "b1",
  name: "Test Board",
  shareLink: "abc",
  ownerId: "u1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

describe("DeleteBoardModal", () => {
  it("returns null when board is null", () => {
    const { container } = render(
      <DeleteBoardModal
        board={null}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows board name and confirmation when board provided", () => {
    render(
      <DeleteBoardModal
        board={mockBoard}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/delete board/i)).toBeInTheDocument();
    expect(screen.getByText(/"Test Board"/)).toBeInTheDocument();
  });

  it("calls onCancel when Cancel clicked", () => {
    const onCancel = vi.fn();
    render(
      <DeleteBoardModal
        board={mockBoard}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onConfirm when Delete clicked", () => {
    const onConfirm = vi.fn();
    render(
      <DeleteBoardModal
        board={mockBoard}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    expect(onConfirm).toHaveBeenCalledWith(mockBoard);
  });

  it("shows Deleting… when isDeleting", () => {
    render(
      <DeleteBoardModal
        board={mockBoard}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isDeleting
      />
    );
    expect(screen.getByRole("button", { name: /deleting/i })).toBeInTheDocument();
  });
});
