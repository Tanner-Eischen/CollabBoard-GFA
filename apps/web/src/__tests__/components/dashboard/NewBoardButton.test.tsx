import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NewBoardButton } from "../../../components/dashboard/NewBoardButton";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe("NewBoardButton", () => {
  it("renders New board button", () => {
    const onCreateBoard = vi.fn().mockResolvedValue({ id: "b1" });
    render(<NewBoardButton onCreateBoard={onCreateBoard} />);
    expect(screen.getByRole("button", { name: /create new board/i })).toBeInTheDocument();
  });

  it("calls onCreateBoard on click", () => {
    const onCreateBoard = vi.fn().mockResolvedValue({ id: "b1" });
    render(<NewBoardButton onCreateBoard={onCreateBoard} />);
    fireEvent.click(screen.getByRole("button", { name: /create new board/i }));
    expect(onCreateBoard).toHaveBeenCalled();
  });

  it("is disabled when disabled prop is true", () => {
    render(<NewBoardButton onCreateBoard={vi.fn()} disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
