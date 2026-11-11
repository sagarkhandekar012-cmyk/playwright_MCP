import { test, expect } from '@playwright/test';

const loginUrl = 'https://superadmin-amoz.betadelivery.com/login';
const validEmail = 'amozit@yopmail.com';
const validPassword = 'Admin@123';
const otp = process.env.OTP ?? '1234';

async function login(page: Parameters<typeof test>[0]['page']) {
  // Navigate to the login page
  await page.goto(loginUrl);

  // Enter email
  await page.getByPlaceholder('Enter your email').fill(validEmail);

  // Enter password
  await page.getByPlaceholder('Enter your password').fill(validPassword);

  // Click Sign In
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  // Verify the OTP screen is displayed
  const otpInputs = page.locator('input[aria-label^="Character"]');
  await expect(otpInputs).toHaveCount(4);

  // Enter the valid OTP
  for (let index = 0; index < otp.length; index++) {
    await otpInputs.nth(index).fill(otp[index]);
  }

  // Click Verify
  await page.getByRole('button', { name: 'Verify', exact: true }).click();

  // Verify the dashboard page is displayed
  await expect(page.getByText('Dashboard Overview', { exact: true })).toBeVisible();
}

test.describe('Sign Out', () => {
  test('signs out successfully and does not show session expired toast', async ({ page }) => {
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

    // Verify the login page is displayed
    await expect(page.getByText('Admin access – log in', { exact: true })).toBeVisible();

    // Verify the logout success toast is displayed
    await expect(page.getByText('Logout Successfully', { exact: true })).toBeVisible();

    // Verify the session expired message is not displayed
    await expect(page.getByText('Your session has expired. Please log in again.', { exact: true })).toHaveCount(0);
  });
});
