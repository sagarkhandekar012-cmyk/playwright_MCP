import { test, expect, type Page } from '@playwright/test';
import { getTestCaseByScenario } from './excel-data';

const loginUrl = 'https://superadmin-amoz.betadelivery.com/login';
const validEmail = 'amozit@yopmail.com';
const validPassword = 'Admin@123';
const otp = process.env.OTP || '1234';
const validLoginTestCase = getTestCaseByScenario('Valid login');

async function login(page: Page) {
  // Navigate to the login page
  await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
  await expect(page.getByPlaceholder('Enter your email')).toBeVisible({ timeout: 15000 });

  // Enter email
  await page.getByPlaceholder('Enter your email').fill(validEmail);

  // Enter password
  await page.getByPlaceholder('Enter your password').fill(validPassword);

  // Click Sign In
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  // Verify the OTP flow is active before trying to enter codes
  await expect(page.getByText('OTP sent successfully', { exact: true })).toBeVisible({ timeout: 20000 });

  // Verify the OTP screen is displayed
  const otpInputs = page.locator('input[aria-label^="Character"]');
  await expect(otpInputs).toHaveCount(4, { timeout: 20000 });

  // Enter the valid OTP
  for (let index = 0; index < otp.length; index++) {
    await otpInputs.nth(index).fill(otp[index]);
  }

  // Click Verify
  await page.getByRole('button', { name: 'Verify', exact: true }).click();

  // Verify the dashboard page is displayed
  await expect(page.getByText('Dashboard Overview', { exact: true })).toBeVisible({ timeout: 30000 });
}

test.describe('Sign Out', () => {
  test.slow();

  test(`signs out successfully and does not show session expired toast (${validLoginTestCase.ID})`, async ({ page }) => {
    // Login with valid user
    await login(page);

    // Click Admin User at the bottom left
    await page.getByText('Admin User', { exact: true }).click();

    // Click Sign Out
    await page.getByText('Sign Out', { exact: true }).click();

    // Verify the confirmation popup is displayed
    await expect(page.getByText('Are you sure you want to Sign Out?', { exact: true })).toBeVisible();

    // Click Sign Out in the popup
    await page.getByRole('button', { name: 'Sign Out', exact: true }).last().click();

    // Verify logout returned to the login page
    await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible({ timeout: 20000 });
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible({ timeout: 20000 });

    // Verify the session-expired message is not displayed
    await expect(page.getByText('Your session has expired. Please log in again.', { exact: true })).toHaveCount(0);
  });
});
