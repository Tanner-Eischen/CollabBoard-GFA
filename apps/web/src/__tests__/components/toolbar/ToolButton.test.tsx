import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToolButton } from "@/components/toolbar/ToolButton";

describe("ToolButton", () => {
  it("renders with label and shortcut in title", () => {
    render(
      <ToolButton
        tool="select"
        label="Select"
        shortcut="V"
        active={false}
        onClick={vi.fn()}
      />
    );
    const btn = screen.getByRole("radio", { name: /select \(v\)/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("title", "Select (V)");
  });

  it("shows active styling when active", () => {
    render(
      <ToolButton
        tool="select"
        label="Select"
        shortcut="V"
        active={true}
        onClick={vi.fn()}
      />
    );
    const btn = screen.getByRole("radio");
    expect(btn).toHaveAttribute("aria-checked", "true");
    expect(btn).toHaveClass("border-blue-500");
  });

  it("shows inactive styling when not active", () => {
    render(
      <ToolButton
        tool="select"
        label="Select"
        shortcut="V"
        active={false}
        onClick={vi.fn()}
      />
    );
    const btn = screen.getByRole("radio");
    expect(btn).toHaveAttribute("aria-checked", "false");
    expect(btn).toHaveClass("border-gray-200");
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(
      <ToolButton
        tool="rectangle"
        label="Rectangle"
        shortcut="R"
        active={false}
        onClick={onClick}
      />
    );
    fireEvent.click(screen.getByRole("radio"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
