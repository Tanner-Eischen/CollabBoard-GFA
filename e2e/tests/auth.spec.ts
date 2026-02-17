import { expect, test } from "@playwright/test";

test("sign in page shows Sign in with Google button", async ({ page }) => {
  await page.goto("/signin");
  await expect(
    page.getByRole("button", { name: /sign in with google/i })
  ).toBeVisible();
});

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("/");
});
