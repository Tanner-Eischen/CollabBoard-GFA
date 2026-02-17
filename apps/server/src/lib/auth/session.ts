import { jwtVerify } from "jose";

export interface SessionPayload {
  userId: string;
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] }
    );
    const userId = payload.userId as string;
    if (!userId) return null;
    return { userId };
  } catch {
    return null;
  }
}

export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim() || null;
}
