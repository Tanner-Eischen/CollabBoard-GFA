import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BoardCard } from "../../../components/dashboard/BoardCard";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockBoard = {
  id: "b1",
  name: "My Board",
  shareLink: "xyz789",
  ownerId: "u1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

describe("BoardCard", () => {
  it("renders board name and link", () => {
    const onDelete = vi.fn();
    render(<BoardCard board={mockBoard} onDelete={onDelete} />);
    expect(screen.getByText("My Board")).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/board/b1");
  });

  it("calls onDelete when Delete clicked", () => {
    const onDelete = vi.fn();
    render(<BoardCard board={mockBoard} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /delete my board/i }));
    expect(onDelete).toHaveBeenCalledWith(mockBoard);
  });

  it("shows Copy link button", () => {
    render(<BoardCard board={mockBoard} onDelete={vi.fn()} />);
    expect(screen.getByRole("button", { name: /copy share link/i })).toBeInTheDocument();
  });
});
