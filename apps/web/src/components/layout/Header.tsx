"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          CollabBoard
        </Link>
        <nav className="flex items-center gap-4">
          {status === "loading" ? (
            <span className="text-sm text-gray-500">Loading...</span>
          ) : session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Button
                variant="ghost"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </Button>
            </>
          ) : (
            <Link href="/signin">
              <Button variant="primary">Sign in</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
