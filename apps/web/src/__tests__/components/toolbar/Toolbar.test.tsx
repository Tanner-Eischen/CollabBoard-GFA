import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { useToolStore } from "@/stores/toolStore";

describe("Toolbar", () => {
  beforeEach(() => {
    useToolStore.setState({ activeTool: "select" });
  });

  it("renders toolbar with all tools", () => {
    render(<Toolbar />);
    const toolbar = screen.getByRole("toolbar", { name: /drawing tools/i });
    expect(toolbar).toBeInTheDocument();

    expect(screen.getByRole("radio", { name: /select \(v\)/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /text \(t\)/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /rectangle \(r\)/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /circle \(o\)/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /line \(l\)/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /connector \(c\)/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /sticky note \(s\)/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /frame \(f\)/i })).toBeInTheDocument();
  });

  it("highlights select tool by default", () => {
    render(<Toolbar />);
    const selectBtn = screen.getByRole("radio", { name: /select \(v\)/i });
    expect(selectBtn).toHaveAttribute("aria-checked", "true");
  });

  it("switches tool when clicking rectangle", () => {
    render(<Toolbar />);
    fireEvent.click(screen.getByRole("radio", { name: /rectangle \(r\)/i }));
    expect(useToolStore.getState().activeTool).toBe("rectangle");
  });

  it("has collapse/expand button", () => {
    render(<Toolbar />);
    const collapseBtn = screen.getByRole("button", { name: /collapse toolbar/i });
    expect(collapseBtn).toBeInTheDocument();
  });
});
