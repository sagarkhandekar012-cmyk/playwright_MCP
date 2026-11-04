import { test, expect } from '@playwright/test';

const loginUrl = 'https://companyadmin-amoz.betadelivery.com/login';
const validEmail = 'cleanerservices@yopmail.com';
const validPassword = 'Test@123';

test.describe('AMOZ Company Admin Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(loginUrl);
  });

  test('TC1: displays the login page elements', async ({ page }) => {
    await expect(page.getByText('Welcome to Company Admin')).toBeVisible();
    await expect(page.getByPlaceholder('Enter Email Id')).toBeVisible();
    await expect(page.getByPlaceholder('Enter Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot Password?' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();

    const languageButton = page.getByRole('button', { name: 'Toggle language' });
    await expect(languageButton).toBeVisible();
    await expect(languageButton).toContainText('AR');
  });

  test('TC2: logs in with valid credentials and displays the dashboard', async ({ page }) => {
    await page.getByPlaceholder('Enter Email Id').fill(validEmail);
    await page.getByPlaceholder('Enter Password').fill(validPassword);
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(page).toHaveURL(/\/cleaning\/dashboard$/);
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Sai service Center/i })).toBeVisible();
    await expect(page.getByText(/Today's Bookings/i)).toBeVisible();
  });

  test('TC3: shows an error and stays on the login page for an invalid password', async ({ page }) => {
    await page.getByPlaceholder('Enter Email Id').fill(validEmail);
    await page.getByPlaceholder('Enter Password').fill('wrongpassword123');
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(page.getByRole('alert')).toContainText('Invalid Login Credentials. Please try again.');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('TC4: shows an error for an unregistered email', async ({ page }) => {
    await page.getByPlaceholder('Enter Email Id').fill('notregistered@example.com');
    await page.getByPlaceholder('Enter Password').fill(validPassword);
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('TC5: displays required-field validation when both fields are empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(page.getByText('Email is required', { exact: true })).toBeVisible();
    await expect(page.getByText('Password is required', { exact: true })).toBeVisible();
  });

  test('TC6: displays required-field validation when the password is empty', async ({ page }) => {
    await page.getByPlaceholder('Enter Email Id').fill(validEmail);
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(page.getByText('Password is required', { exact: true })).toBeVisible();
  });

  test('TC7: displays email-format validation for an invalid email', async ({ page }) => {
    await page.getByPlaceholder('Enter Email Id').fill('abc.com');
    await page.getByPlaceholder('Enter Password').fill(validPassword);
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(page.getByText('Please enter a valid email', { exact: true })).toBeVisible();
  });

  test('TC8: shows and hides the password', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('Enter Password');
    await passwordInput.fill('Test@1234');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await page.getByRole('button', { name: 'Show password' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await expect(passwordInput).toHaveValue('Test@1234');

    await page.getByRole('button', { name: 'Hide password' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('TC9: opens the forgot-password page', async ({ page }) => {
    await page.getByRole('link', { name: 'Forgot Password?' }).click();

    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(page.getByText('Reset Your Password', { exact: true })).toBeVisible();
  });

  test('TC10: opens the sign-up service-selection page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign up' }).click();

    await expect(page).toHaveURL(/\/select-service$/);
    await expect(page.getByText('Select a Service')).toBeVisible();
  });

  test('TC11: switches the login page between English and Arabic', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle language' }).click();
    await expect(page.getByText('مرحبًا بك في إدارة الشركة')).toBeVisible();
    await expect(page.getByPlaceholder('أدخل البريد الإلكتروني')).toBeVisible();

    await page.getByRole('button', { name: 'Toggle language' }).click();
    await expect(page.getByText('Welcome to Company Admin')).toBeVisible();
  });
});
