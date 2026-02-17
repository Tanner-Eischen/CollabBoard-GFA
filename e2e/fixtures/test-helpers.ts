import type { Page } from "@playwright/test";

export async function seedE2ESession(page: Page): Promise<void> {
  const response = await page.request.get("/api/test-auth/signin");

  if (!response.ok()) {
    throw new Error(`Failed to seed E2E session: ${response.status()}`);
  }
}

export async function clearE2ESession(page: Page): Promise<void> {
  const response = await page.request.get("/api/test-auth/signout");

  if (!response.ok()) {
    throw new Error(`Failed to clear E2E session: ${response.status()}`);
  }
}
