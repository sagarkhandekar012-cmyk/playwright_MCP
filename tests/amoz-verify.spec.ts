import { test, expect, type Page } from '@playwright/test';

const loginUrl = 'https://companyadmin-amoz.betadelivery.com/login';
const validEmail = 'rentvehicle@yopmail.com';
const validPassword = 'Test@123';

async function logIn(page: Page) {
  await page.getByPlaceholder('Enter Email Id').fill(validEmail);
  await page.getByPlaceholder('Enter Password').fill(validPassword);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page).toHaveURL(/\/rent-vehicle\/dashboard$/);
}

test.describe('AMOZ Company Admin login and dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(loginUrl);
  });

  test('TC1: logs in and verifies dashboard content and profile menu', async ({ page }) => {
    await logIn(page);

    await expect(page.locator('img[src*="AMOZit"]')).toBeVisible();
    const breadcrumb = page.getByText('Rent Vehicle', { exact: true }).locator('..').locator('..');
    await expect(breadcrumb).toHaveText(/Rent Vehicle\s*›\s*Dashboard/);
    await expect(page.getByRole('button', { name: 'Toggle language' })).toContainText('العربية');
    await expect(page.locator('button').filter({ has: page.locator('svg.lucide-bell') })).toBeVisible();

    const userMenu = page.getByRole('heading', { name: /Drive Cars/ });
    await expect(userMenu).toBeVisible();
    await expect(userMenu.locator('svg.lucide-chevron-down')).toBeVisible();

    const sidebar = page.getByRole('complementary');
    for (const item of [
      'Dashboard',
      'Booking Management',
      'Manage Employee',
      'Vehicle Management',
      'Discount Management',
      'Payment Management',
      'Subscription model',
      'General Queries',
    ]) {
      await expect(sidebar.getByText(item, { exact: true })).toBeVisible();
    }
    const vehicleManagement = sidebar
      .locator('button[aria-controls]')
      .filter({ hasText: 'Vehicle Management' });
    await expect(vehicleManagement.locator('svg.lucide-chevron-down')).toBeVisible();

    for (const card of [
      'Total Number Of Booked Services',
      'Total Number Of Services Offered',
      'Booking Rate',
    ]) {
      await expect(page.getByText(card, { exact: true })).toBeVisible();
    }

    await expect(page.getByText("Today's Bookings", { exact: true })).toBeVisible();
    await expect(page.getByText('View All →', { exact: true })).toBeVisible();
    await expect(page.getByText('No bookings available', { exact: true })).toBeVisible();
    await expect(
      page.getByText('Bookings will appear here once customers make a reservation', { exact: true }),
    ).toBeVisible();

    await expect(page.getByText('Revenue Overview', { exact: true })).toBeVisible();
    await expect(page.getByText('Today', { exact: true })).toBeVisible();
    for (const tab of ['Daily', 'Weekly', 'Monthly']) {
      await expect(page.getByRole('button', { name: tab, exact: true })).toBeVisible();
    }

    await userMenu.click();
    await expect(page.getByText('drivecars', { exact: true })).toBeVisible();
    await expect(page.getByText(validEmail, { exact: true })).toBeVisible();
    for (const option of ['Profile', 'Support', 'Sign Out']) {
      await expect(page.getByText(option, { exact: true })).toBeVisible();
    }
  });

  test('TC2: signs out and verifies the login page', async ({ page }) => {
    await logIn(page);
    await expect(page.getByText("Today's Bookings", { exact: true })).toBeVisible();

    await page.getByRole('heading', { name: /Drive Cars/ }).click();
    await page.getByText('Sign Out', { exact: true }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('Welcome to Company Admin', { exact: true })).toBeVisible();
    await expect(page.getByText('Please Login to continue', { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Enter Email Id')).toBeVisible();
    await expect(page.getByPlaceholder('Enter Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot Password?' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  });
});
