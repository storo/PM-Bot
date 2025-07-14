import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/PM-Bot Frontend/);
});

test('get started link', async ({ page }) => {
  await page.goto('/');

  // Click the get started link.
  await page.getByRole('button', { name: 'Register' }).click();

  // Expects the URL to contain a substring.
  await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();
});