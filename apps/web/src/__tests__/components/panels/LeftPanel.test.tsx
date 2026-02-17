import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LeftPanel } from "@/components/panels/LeftPanel";

const STORAGE_KEY = "collabboard-left-panel-collapsed";

describe("LeftPanel", () => {
  const mockHandlers = {
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
    onClickTemplate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it("renders Object Library when expanded", () => {
    render(<LeftPanel boardId="b1" onDragCreate={mockHandlers} />);

    expect(screen.getByText("Object Library")).toBeInTheDocument();
    expect(screen.getByText("Objects")).toBeInTheDocument();
    expect(screen.getByText("Rectangle")).toBeInTheDocument();
    expect(screen.getByText("Circle")).toBeInTheDocument();
  });

  it("collapses when collapse button is clicked", () => {
    render(<LeftPanel boardId="b1" onDragCreate={mockHandlers} />);

    const collapseBtn = screen.getByRole("button", {
      name: /collapse object library/i,
    });
    fireEvent.click(collapseBtn);

    expect(screen.queryByText("Objects")).not.toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("true");
  });

  it("expands when expand button is clicked after collapse", () => {
    localStorage.setItem(STORAGE_KEY, "true");
    render(<LeftPanel boardId="b1" onDragCreate={mockHandlers} />);

    expect(screen.queryByText("Objects")).not.toBeInTheDocument();

    const expandBtn = screen.getByRole("button", {
      name: /expand object library/i,
    });
    fireEvent.click(expandBtn);

    expect(screen.getByText("Objects")).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("false");
  });

  it("persists collapsed state in localStorage", async () => {
    localStorage.setItem(STORAGE_KEY, "true");
    render(<LeftPanel boardId="b1" onDragCreate={mockHandlers} />);

    await waitFor(() => {
      expect(screen.queryByText("Objects")).not.toBeInTheDocument();
    });
  });
});
