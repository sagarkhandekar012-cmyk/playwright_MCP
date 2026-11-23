import { test, expect } from '@playwright/test';

const loginUrl =
  'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';

test.describe('Admin module access', () => {
  test('allows an Admin user to access System Users', async ({ page }) => {
    await page.goto(loginUrl);

    await page.getByRole('textbox', { name: 'Username' }).fill('Admin');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin123');
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await page.waitForURL('**/web/index.php/dashboard/index');

    await page.getByRole('link', { name: 'Admin', exact: true }).click({ force: true });

    await page.waitForURL('**/web/index.php/admin/viewSystemUsers');
    await expect(page.getByRole('heading', { name: 'System Users', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Add/ })).toBeVisible();
  });
});
