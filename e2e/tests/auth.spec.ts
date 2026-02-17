import { expect, test } from "@playwright/test";
import { clearE2ESession, seedE2ESession } from "../fixtures/test-helpers";

test("sign in page loads", async ({ page }) => {
  await page.goto("/signin");
  await expect(page.getByRole("heading", { name: /sign in to collabboard/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /sign in with google/i })).toBeVisible();
});

test("protected route redirects when not signed in", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/signin$/);
});

test("sign in -> redirect to dashboard", async ({ page }) => {
  await seedE2ESession(page);
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("sign out -> redirect to landing", async ({ page }) => {
  await seedE2ESession(page);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard$/);

  await clearE2ESession(page);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/signin$/);

  await page.goto("/");
  await expect(page).toHaveURL("/");
});
