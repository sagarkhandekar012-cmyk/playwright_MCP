import { test, expect } from '@playwright/test';

test.describe('Login Functionality', () => {
  test('should successfully log in with valid credentials and display the dashboard', async ({ page }) => {
    // 1. Navigate to OrangeHRM login page
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');

    // 2. Enter username "Admin"
    const usernameInput = page.getByPlaceholder('Username');
    await expect(usernameInput).toBeVisible();
    await usernameInput.fill('Admin');

    // 3. Enter password "admin123"
    const passwordInput = page.getByPlaceholder('Password');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('admin123');

    // 4. Click on Login button
    const loginButton = page.getByRole('button', { name: 'Login' });
    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    // 5. Verify that the dashboard page is displayed
    await expect(page).toHaveURL(/.*dashboard\/index/);

    const dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
    await expect(dashboardHeading).toBeVisible();
  });
});

