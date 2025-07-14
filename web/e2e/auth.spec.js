import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow a user to register and then log in', async ({ page }) => {
    await page.goto('/');

    // Register a new user
    await page.getByPlaceholder('Email').fill('test-register@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByPlaceholder('Full Name').fill('Test User');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('Registration successful!')).toBeVisible();
    await page.getByRole('button', { name: 'Logout' }).click(); // Logout after registration

    // Log in with the newly registered user
    await page.getByPlaceholder('Email').fill('test-register@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText(/Logged in as test-register@example.com/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

    // Simulate onboarding completion
    await page.getByRole('button', { name: 'Complete Onboarding' }).click();
    await expect(page.getByText('Onboarding completed! You can now use the chat.')).toBeVisible();
  });

  test('should allow a user to log in with Google', async ({ page }) => {
    await page.goto('/');

    // Click the Google login button
    await page.getByRole('button', { name: 'Login with Google' }).click();

    // In a real scenario, this would involve mocking Google's OAuth flow
    // For now, we'll just check for a success message assuming the mock works.
    // You would typically use a tool like `msw` or `nock` to mock external OAuth providers.
    await expect(page.getByText('Google login successful!')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

    // Simulate onboarding completion
    await page.getByRole('button', { name: 'Complete Onboarding' }).click();
    await expect(page.getByText('Onboarding completed! You can now use the chat.')).toBeVisible();
  });
});