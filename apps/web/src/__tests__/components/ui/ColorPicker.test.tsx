import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ColorPicker } from "@/components/ui/ColorPicker";

describe("ColorPicker", () => {
  it("renders color swatch and preset buttons", () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#3b82f6" onChange={onChange} />);

    const swatch = screen.getByLabelText("Color swatch");
    expect(swatch).toBeInTheDocument();
    expect(swatch).toHaveStyle({ backgroundColor: "#3b82f6" });
  });

  it("calls onChange when preset is clicked", () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#3b82f6" onChange={onChange} />);

    const redButton = screen.getByLabelText("Select #ef4444");
    fireEvent.click(redButton);

    expect(onChange).toHaveBeenCalledWith("#ef4444");
  });

  it("shows Mixed when mixed prop is true", () => {
    render(<ColorPicker value="#3b82f6" onChange={vi.fn()} mixed />);

    expect(screen.getByText("Mixed")).toBeInTheDocument();
  });

  it("does not call onChange when disabled", () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#3b82f6" onChange={onChange} disabled />);

    const redButton = screen.getByLabelText("Select #ef4444");
    fireEvent.click(redButton);

    expect(onChange).not.toHaveBeenCalled();
  });
});
