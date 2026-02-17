import { expect, test } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: /collabboard/i })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /sign in/i })
  ).toBeVisible();
});
