import { test, expect } from '@playwright/test';

test.describe('Conversational Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Log in a user before each conversational test
    await page.goto('/');
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText(/Logged in as test@example.com/)).toBeVisible();
    // Complete onboarding if visible
    const onboardingButton = page.getByRole('button', { name: 'Complete Onboarding' });
    if (await onboardingButton.isVisible()) {
      await onboardingButton.click();
      await expect(page.getByText('Onboarding completed!')).toBeVisible();
    }
  });

  test('should allow user to send a message and receive a bot response', async ({ page }) => {
    const userMessage = 'Hello PM-Bot, how are you?';
    await page.getByPlaceholder('Type your message...').fill(userMessage);
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(page.locator('.chat-container')).toContainText(`You: ${userMessage}`);
    await expect(page.locator('.chat-container')).toContainText('PM-Bot: Mocked bot response'); // Expecting mocked response from engine
  });

  test('should handle task creation via conversation', async ({ page }) => {
    const userMessage = 'Create a task: Implement user authentication';
    await page.getByPlaceholder('Type your message...').fill(userMessage);
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(page.locator('.chat-container')).toContainText(`You: ${userMessage}`);
    // Expecting a response that indicates task creation intent
    await expect(page.locator('.chat-container')).toContainText(/Entendido, quieres crear una tarea/);
  });

  test('should handle project status query via conversation', async ({ page }) => {
    const userMessage = 'What is the status of project X?';
    await page.getByPlaceholder('Type your message...').fill(userMessage);
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(page.locator('.chat-container')).toContainText(`You: ${userMessage}`);
    // Expecting a response that indicates project status query intent
    await expect(page.locator('.chat-container')).toContainText(/Quieres consultar el estado/);
  });
});