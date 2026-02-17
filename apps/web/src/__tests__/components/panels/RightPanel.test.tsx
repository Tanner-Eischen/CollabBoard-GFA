import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RightPanel } from "@/components/panels/RightPanel";

describe("RightPanel", () => {
  it("renders PropertiesPanel", () => {
    render(<RightPanel />);

    expect(screen.getByText("Properties")).toBeInTheDocument();
  });

  it("applies custom width", () => {
    const { container } = render(<RightPanel width={320} />);

    const aside = container.querySelector("aside");
    expect(aside).toHaveStyle({ width: "320px" });
  });
});
