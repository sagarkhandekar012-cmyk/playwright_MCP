import { test, expect } from '@playwright/test';
import { getTestCaseByScenario } from './excel-data';

const loginUrl = 'https://superadmin-amoz.betadelivery.com/login';
const validEmail = 'amozit@yopmail.com';
const wrongPassword = 'Wrong@123';
const wrongPasswordTestCase = getTestCaseByScenario('Wrong password');

test.describe('Wrong Password', () => {
  test(`shows an error and keeps the user on the login page (${wrongPasswordTestCase.ID})`, async ({ page }) => {
    // Navigate to the login page
    await page.goto(loginUrl);

    // Enter email
    await page.getByPlaceholder('Enter your email').fill(validEmail);

    // Enter wrong password
    await page.getByPlaceholder('Enter your password').fill(wrongPassword);

    // Click Sign In
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Verify an error message is displayed
    await expect(page.getByText(/Invalid Login Credentials|invalid|error/i)).toBeVisible();

    // Verify the user stays on the login page
    await expect(page).toHaveURL(/\/login$/);
  });
  
});
