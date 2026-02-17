import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/Header";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
  signOut: vi.fn(),
}));

describe("Header", () => {
  it("renders CollabBoard link", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /collabboard/i })).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("shows Sign in when unauthenticated", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });
});
