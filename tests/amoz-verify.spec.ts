import { test, expect, type Page } from '@playwright/test';

const loginUrl = 'https://companyadmin-amoz.betadelivery.com/login';
const validEmail = 'rentvehicle@yopmail.com';
const validPassword = 'Test@123';

async function logIn(page: Page) {
  // Enter the registered rental-company email address.
  await page.getByPlaceholder('Enter Email Id').fill(validEmail);
  // Enter the password for the rental-company account.
  await page.getByPlaceholder('Enter Password').fill(validPassword);
  // Submit the login form.
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  // Confirm that login navigated to the rental-vehicle dashboard.
  await expect(page).toHaveURL(/\/rent-vehicle\/dashboard$/);
}

test.describe('AMOZ Company Admin login and dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Open the application login page before each test.
    await page.goto(loginUrl);
  });

  test('TC1: logs in and verifies dashboard content and profile menu', async ({ page }) => {
    // Log in with the rental-company credentials and verify dashboard navigation.
    await logIn(page);

    // Verify that the AMOZit logo is displayed.
    await expect(page.locator('img[src*="AMOZit"]')).toBeVisible();
    // Locate the breadcrumb container that contains both breadcrumb labels.
    const breadcrumb = page.getByText('Rent Vehicle', { exact: true }).locator('..').locator('..');
    // Verify that the breadcrumb lists Rent Vehicle followed by Dashboard.
    await expect(breadcrumb).toHaveText(/Rent Vehicle\s*›\s*Dashboard/);
    // Verify that the language button displays Arabic.
    await expect(page.getByRole('button', { name: 'Toggle language' })).toContainText('العربية');
    // Verify that the notification bell button is visible without checking its count.
    await expect(page.locator('button').filter({ has: page.locator('svg.lucide-bell') })).toBeVisible();

    // Locate the profile menu by its visible company name.
    const userMenu = page.getByRole('heading', { name: /Drive Cars/ });
    // Verify that the profile menu is visible.
    await expect(userMenu).toBeVisible();
    // Verify that the profile menu shows its dropdown arrow.
    await expect(userMenu.locator('svg.lucide-chevron-down')).toBeVisible();

    // Locate the dashboard sidebar.
    const sidebar = page.getByRole('complementary');
    // Verify that every requested navigation item is visible in the sidebar.
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
    // Locate the expandable Vehicle Management sidebar button.
    const vehicleManagement = sidebar
      .locator('button[aria-controls]')
      .filter({ hasText: 'Vehicle Management' });
    // Verify that Vehicle Management displays its dropdown arrow.
    await expect(vehicleManagement.locator('svg.lucide-chevron-down')).toBeVisible();

    // Verify that each requested summary-card heading is visible.
    for (const card of [
      'Total Number Of Booked Services',
      'Total Number Of Services Offered',
      'Booking Rate',
    ]) {
      await expect(page.getByText(card, { exact: true })).toBeVisible();
    }

    // Verify that the Today's Bookings section heading is visible.
    await expect(page.getByText("Today's Bookings", { exact: true })).toBeVisible();
    // Verify that the View All link is visible.
    await expect(page.getByText('View All →', { exact: true })).toBeVisible();
    // Verify that the bookings empty-state title is visible.
    await expect(page.getByText('No bookings available', { exact: true })).toBeVisible();
    // Verify that the bookings empty-state explanation is visible.
    await expect(
      page.getByText('Bookings will appear here once customers make a reservation', { exact: true }),
    ).toBeVisible();

    // Verify that the Revenue Overview section heading is visible.
    await expect(page.getByText('Revenue Overview', { exact: true })).toBeVisible();
    // Verify that the current revenue period badge says Today.
    await expect(page.getByText('Today', { exact: true })).toBeVisible();
    // Verify that each revenue-period tab is visible.
    for (const tab of ['Daily', 'Weekly', 'Monthly']) {
      await expect(page.getByRole('button', { name: tab, exact: true })).toBeVisible();
    }

    // Open the Drive Cars profile menu.
    await userMenu.click();
    // Verify that the profile menu displays the account username.
    await expect(page.getByText('drivecars', { exact: true })).toBeVisible();
    // Verify that the profile menu displays the account email address.
    await expect(page.getByText(validEmail, { exact: true })).toBeVisible();
    // Verify that each requested profile-menu option is visible.
    for (const option of ['Profile', 'Support', 'Sign Out']) {
      await expect(page.getByText(option, { exact: true })).toBeVisible();
    }
  });

  test('TC2: signs out and verifies the login page', async ({ page }) => {
    // Log in with the rental-company credentials and verify dashboard navigation.
    await logIn(page);
    // Confirm that dashboard content is loaded before signing out.
    await expect(page.getByText("Today's Bookings", { exact: true })).toBeVisible();

    // Open the Drive Cars profile menu.
    await page.getByRole('heading', { name: /Drive Cars/ }).click();
    // Choose Sign Out from the profile menu.
    await page.getByText('Sign Out', { exact: true }).click();

    // Verify that signing out navigates back to the login page.
    await expect(page).toHaveURL(/\/login$/);
    // Verify that the login page welcome heading is displayed.
    await expect(page.getByText('Welcome to Company Admin', { exact: true })).toBeVisible();
    // Verify that the login page instruction is displayed.
    await expect(page.getByText('Please Login to continue', { exact: true })).toBeVisible();
    // Verify that the email field is visible.
    await expect(page.getByPlaceholder('Enter Email Id')).toBeVisible();
    // Verify that the password field is visible.
    await expect(page.getByPlaceholder('Enter Password')).toBeVisible();
    // Verify that the Login button is visible.
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
    // Verify that the Forgot Password link is visible.
    await expect(page.getByRole('link', { name: 'Forgot Password?' })).toBeVisible();
    // Verify that the Sign up link is visible.
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  });
});
