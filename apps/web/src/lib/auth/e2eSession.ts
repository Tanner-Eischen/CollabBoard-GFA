import { cookies } from "next/headers";

export const E2E_SESSION_COOKIE = "collabboard-e2e-session";

export type E2ESession = {
  user: {
    id: string;
    email: string;
    name: string;
  };
};

export async function getE2ESession(): Promise<E2ESession | null> {
  if (process.env.E2E_AUTH_ENABLED !== "true") {
    return null;
  }

  const cookieStore = await cookies();
  const cookie = cookieStore.get(E2E_SESSION_COOKIE)?.value;

  if (!cookie) {
    return null;
  }

  return {
    user: {
      id: "e2e-user",
      email: "e2e@collabboard.local",
      name: "E2E User",
    },
  };
}
