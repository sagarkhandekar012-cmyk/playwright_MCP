import { test, expect } from '@playwright/test';

test.describe('AMOZ Company Admin Login Functionality', () => {
  test('should successfully log in with valid credentials and display the dashboard', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('https://companyadmin-amoz.betadelivery.com/login');

    // 2. Enter email
    const emailInput = page.getByPlaceholder('Enter Email Id');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('cleanerservices@yopmail.com');

    // 3. Enter password
    const passwordInput = page.getByPlaceholder('Enter Password');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('Test@123');

    // 4. Click on Login button
    const loginButton = page.getByRole('button', { name: 'Login', exact: true });
    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    // 5. Verify that the dashboard page is displayed
    await expect(page).toHaveURL(/.*\/cleaning\/dashboard/);

    // Verify key elements on the dashboard
    const dashboardLink = page.getByRole('link', { name: /Dashboard/i });
    await expect(dashboardLink).toBeVisible();

    const companyHeading = page.getByRole('heading', { name: /Sai service Center/i });
    await expect(companyHeading).toBeVisible();

    await expect(page.getByText(/Today's Bookings/i)).toBeVisible();
  });

  test('validates email format when non-email username is entered', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('https://companyadmin-amoz.betadelivery.com/login');

    // 2. Enter non-email username "Admin"
    const emailInput = page.getByPlaceholder('Enter Email Id');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('Admin');

    // 3. Enter password "Test@123"
    const passwordInput = page.getByPlaceholder('Enter Password');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('Test@123');

    // 4. Click on Login button
    const loginButton = page.getByRole('button', { name: 'Login', exact: true });
    await loginButton.click();

    // 5. Verify client-side validation triggers and user remains on login page
    const validationMessage = page.getByText('Please enter a valid email');
    await expect(validationMessage).toBeVisible();
    await expect(page).toHaveURL(/.*\/login/);
  });
});
