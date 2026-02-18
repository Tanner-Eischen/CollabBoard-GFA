import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function POST() {
  if (process.env.E2E_AUTH_ENABLED !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const board = {
    id: randomUUID(),
    shareLink: randomUUID(),
    name: "E2E Fixture Board",
    ownerId: "e2e-user",
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ data: board });
}
