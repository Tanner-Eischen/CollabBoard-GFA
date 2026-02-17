import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "../../../components/layout/Header";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

import { useSession } from "next-auth/react";

describe("Header", () => {
  it("shows sign in when no session", () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: vi.fn(),
    });

    render(<Header />);

    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows dashboard link when signed in", () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { id: "u1", name: "Test", email: "test@example.com" },
        expires: "2099-01-01T00:00:00.000Z",
      },
      status: "authenticated",
      update: vi.fn(),
    });

    render(<Header />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
  });
});
