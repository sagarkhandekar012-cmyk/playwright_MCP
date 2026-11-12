import { test, expect } from '@playwright/test';
import { getTestCaseByScenario } from './excel-data';

const loginUrl = 'https://superadmin-amoz.betadelivery.com/login';
const validEmail = 'amozit@yopmail.com';
const validPassword = 'Admin@123';
const otp = process.env.OTP ?? '1234';
const loginTestCase = getTestCaseByScenario('Valid login');

test.describe('Login Functionality', () => {
  test(`logs in successfully with OTP flow (${loginTestCase.ID})`, async ({ page }) => {
    // Navigate to the login page
    await page.goto(loginUrl);

    // Verify the login page is displayed
    await expect(page.getByText('Admin access – log in', { exact: true })).toBeVisible();

    // Enter email
    await page.getByPlaceholder('Enter your email').fill(validEmail);

    // Enter password
    await page.getByPlaceholder('Enter your password').fill(validPassword);

    // Click Sign In
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Verify the OTP toast is displayed
    await expect(page.getByText('OTP sent successfully', { exact: true })).toBeVisible();

    // Verify the OTP screen and timer are displayed
    const otpInputs = page.locator('input[aria-label^="Character"]');
    await expect(otpInputs).toHaveCount(4);
    await expect(page.getByText('OTP expires in 0:59', { exact: true })).toBeVisible();

    // Enter the valid OTP
    for (let index = 0; index < otp.length; index++) {
      await otpInputs.nth(index).fill(otp[index]);
    }

    // Click Verify
    await page.getByRole('button', { name: 'Verify', exact: true }).click();

    // Verify the login success toast is displayed
    await expect(page.getByText('Login Successfully', { exact: true })).toBeVisible();

    // Verify the dashboard page is displayed
    await expect(page.getByText('Dashboard Overview', { exact: true })).toBeVisible();
  });
});
