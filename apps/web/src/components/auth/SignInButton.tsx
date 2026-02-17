"use client";

import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
    >
      Sign in with Google
    </button>
  );
}
