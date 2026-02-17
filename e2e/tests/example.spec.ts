import { expect, test } from '@playwright/test';

test('placeholder e2e scaffold', async ({ page }) => {
  await page.setContent('<h1>CollabBoard - Coming Soon</h1>');
  await expect(page.getByRole('heading', { name: 'CollabBoard - Coming Soon' })).toBeVisible();
});
