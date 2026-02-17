import type { Page } from "@playwright/test";

/**
 * Seeds the E2E test session by visiting the test-auth signin endpoint.
 * Only works when E2E_AUTH_ENABLED=true on the server.
 */
export async function seedE2ESession(page: Page): Promise<void> {
  await page.goto("/api/test-auth/signin");
}

/**
 * Clears the E2E test session by visiting the test-auth signout endpoint.
 */
export async function clearE2ESession(page: Page): Promise<void> {
  await page.goto("/api/test-auth/signout");
}
