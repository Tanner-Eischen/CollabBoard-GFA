import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PresenceIndicator } from "@/components/board/PresenceIndicator";
import { usePresenceStore } from "@/stores/presenceStore";

describe("PresenceIndicator", () => {
  beforeEach(() => {
    usePresenceStore.getState().reset();
  });

  it("renders nothing when no users", () => {
    const { container } = render(<PresenceIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it("renders user list when users present", () => {
    usePresenceStore.getState().setUsers([
      { userId: "u1", displayName: "Alice", color: "#ef4444" },
      { userId: "u2", displayName: "Bob", color: "#22c55e" },
    ]);
    render(<PresenceIndicator />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Present:")).toBeInTheDocument();
  });
});
