import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ObjectLibrary } from "@/components/panels/ObjectLibrary";

describe("ObjectLibrary", () => {
  it("renders all object templates", () => {
    render(<ObjectLibrary boardId="b1" />);

    expect(screen.getByText("Objects")).toBeInTheDocument();
    expect(screen.getByText("Rectangle")).toBeInTheDocument();
    expect(screen.getByText("Circle")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
    expect(screen.getByText("Sticky Note")).toBeInTheDocument();
    expect(screen.getByText("Line")).toBeInTheDocument();
    expect(screen.getByText("Arrow")).toBeInTheDocument();
    expect(screen.getByText("Image")).toBeInTheDocument();
  });

  it("calls onClick when template is clicked", () => {
    const onClick = vi.fn();
    render(<ObjectLibrary boardId="b1" onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: /rectangle/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables buttons when boardId is null", () => {
    render(<ObjectLibrary boardId={null} />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
