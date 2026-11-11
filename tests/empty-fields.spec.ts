import { test, expect } from '@playwright/test';

const loginUrl = 'https://superadmin-amoz.betadelivery.com/login';

test.describe('Empty Fields', () => {
  test('shows required-field validation when fields are empty', async ({ page }) => {
    // Navigate to the login page
    await page.goto(loginUrl);

    // Leave email and password empty

    // Click Sign In
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Verify required-field errors are displayed
    await expect(page.getByText('Email is required', { exact: true })).toBeVisible();
    await expect(page.getByText('Password is required', { exact: true })).toBeVisible();
  });
});
