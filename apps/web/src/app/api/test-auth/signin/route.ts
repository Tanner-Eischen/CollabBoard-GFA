import { NextResponse } from "next/server";
import { E2E_SESSION_COOKIE } from "@/lib/auth/e2eSession";

export async function GET() {
  if (process.env.E2E_AUTH_ENABLED !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(E2E_SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}
