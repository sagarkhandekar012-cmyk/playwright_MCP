import { test, expect } from '@playwright/test';

test.describe('AMOZ Company Admin Logout Functionality', () => {
  test('signs out and returns to the login page', async ({ page }) => {
    await page.goto('https://companyadmin-amoz.betadelivery.com/login');

    await page.getByPlaceholder('Enter Email Id').fill('cleanerservices@yopmail.com');
    await page.getByPlaceholder('Enter Password').fill('Test@123');
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(page).toHaveURL(/\/cleaning\/dashboard$/);

    await page.getByRole('heading', { name: 'S Sai service Center' }).click();
    const signOutOption = page.getByText('Sign Out', { exact: true });
    await expect(signOutOption).toBeVisible();
    await signOutOption.click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('Welcome to Company Admin')).toBeVisible();
    await expect(page.getByPlaceholder('Enter Email Id')).toBeVisible();
  
  await page.waitForTimeout(5000); // Wait for 2 seconds to ensure the page has fully loaded
  });
});
