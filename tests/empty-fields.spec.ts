import { test, expect } from '@playwright/test';
import { getTestCaseByScenario } from './excel-data';

const loginUrl = 'https://superadmin-amoz.betadelivery.com/login';
const emptyFieldsTestCase = getTestCaseByScenario('Empty fields');

test.describe('Empty Fields', () => {
  test(`shows required-field validation when fields are empty (${emptyFieldsTestCase.ID})`, async ({ page }) => {
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
