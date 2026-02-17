import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConnectionStatus } from "@/components/board/ConnectionStatus";

describe("ConnectionStatus", () => {
  it("renders connected state", () => {
    render(<ConnectionStatus status="connected" />);
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("renders reconnecting state", () => {
    render(<ConnectionStatus status="reconnecting" />);
    expect(screen.getByText("Reconnecting…")).toBeInTheDocument();
  });

  it("renders offline state", () => {
    render(<ConnectionStatus status="offline" />);
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });
});
