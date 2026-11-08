import { test, expect } from '@playwright/test';

const loginUrl = 'https://companyadmin-amoz.betadelivery.com/login';
const validEmail = 'cleanerservices@yopmail.com';
const validPassword = 'Test@123';

test.describe('AMOZ Company Admin Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Open the application login page before each test.
    await page.goto(loginUrl);
  });

  test('TC1: displays the login page elements', async ({ page }) => {
    // Verify that the login page welcome heading is visible.
    await expect(page.getByText('Welcome to Company Admin')).toBeVisible();
    // Verify that the email input is visible.
    await expect(page.getByPlaceholder('Enter Email Id')).toBeVisible();
    // Verify that the password input is visible.
    await expect(page.getByPlaceholder('Enter Password')).toBeVisible();
    // Verify that the Login button is visible.
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
    // Verify that the Forgot Password link is visible.
    await expect(page.getByRole('link', { name: 'Forgot Password?' })).toBeVisible();
    // Verify that the Sign up link is visible.
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();

    // Locate the language toggle button by its accessible name.
    const languageButton = page.getByRole('button', { name: 'Toggle language' });
    // Verify that the language toggle button is visible.
    await expect(languageButton).toBeVisible();
    // Verify that the button displays the Arabic-language abbreviation.
    await expect(languageButton).toContainText('AR');
  });

  test('TC2: logs in with valid credentials and displays the dashboard', async ({ page }) => {
    // Enter the registered email address in the email field.
    await page.getByPlaceholder('Enter Email Id').fill(validEmail);
    // Enter the valid password in the password field.
    await page.getByPlaceholder('Enter Password').fill(validPassword);
    // Submit the login form.
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Verify successful login navigates to the cleaning dashboard.
    await expect(page).toHaveURL(/\/cleaning\/dashboard$/);
    // Verify that the dashboard navigation item is visible.
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible();
    // Verify that the service-center heading is visible on the dashboard.
    await expect(page.getByRole('heading', { name: /Sai service Center/i })).toBeVisible();
    // Verify that the dashboard's Today's Bookings section is visible.
    await expect(page.getByText(/Today's Bookings/i)).toBeVisible();
  });

  test('TC3: shows an error and stays on the login page for an invalid password', async ({ page }) => {
    // Enter the registered email address in the email field.
    await page.getByPlaceholder('Enter Email Id').fill(validEmail);
    // Enter an incorrect password to exercise the invalid-password flow.
    await page.getByPlaceholder('Enter Password').fill('wrongpassword123');
    // Submit the login form with the incorrect password.
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Verify that the application displays its invalid-credentials message.
    await expect(page.getByRole('alert')).toContainText('Invalid Login Credentials. Please try again.');
    // Verify that the failed login leaves the user on the login page.
    await expect(page).toHaveURL(/\/login$/);
  });

  test('TC4: shows an error for an unregistered email', async ({ page }) => {
    // Enter an email address that is not registered with the application.
    await page.getByPlaceholder('Enter Email Id').fill('notregistered@example.com');
    // Enter the valid password for the login attempt.
    await page.getByPlaceholder('Enter Password').fill(validPassword);
    // Submit the login form with the unregistered email.
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Verify that the application displays an error alert.
    await expect(page.getByRole('alert')).toBeVisible();
    // Verify that the failed login leaves the user on the login page.
    await expect(page).toHaveURL(/\/login$/);
  });

  test('TC5: displays required-field validation when both fields are empty', async ({ page }) => {
    // Submit the form without entering an email or password.
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Verify that validation marks the email field as required.
    await expect(page.getByText('Email is required', { exact: true })).toBeVisible();
    // Verify that validation marks the password field as required.
    await expect(page.getByText('Password is required', { exact: true })).toBeVisible();
  });

  test('TC6: displays required-field validation when the password is empty', async ({ page }) => {
    // Enter a valid email address while leaving the password blank.
    await page.getByPlaceholder('Enter Email Id').fill(validEmail);
    // Submit the form without a password.
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Verify that validation requests a password.
    await expect(page.getByText('Password is required', { exact: true })).toBeVisible();
  });

  test('TC7: displays email-format validation for an invalid email', async ({ page }) => {
    // Enter text that does not have a valid email format.
    await page.getByPlaceholder('Enter Email Id').fill('abc.com');
    // Enter a password so only the email format is invalid.
    await page.getByPlaceholder('Enter Password').fill(validPassword);
    // Submit the form to trigger email-format validation.
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Verify that the application displays the invalid-email message.
    await expect(page.getByText('Please enter a valid email', { exact: true })).toBeVisible();
  });

  test('TC8: shows and hides the password', async ({ page }) => {
    // Locate the password input for the visibility checks.
    const passwordInput = page.getByPlaceholder('Enter Password');
    // Fill the password input with a test password.
    await passwordInput.fill('Test@1234');
    // Verify that the password is initially masked.
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the control that reveals the password.
    await page.getByRole('button', { name: 'Show password' }).click();
    // Verify that revealing the password changes the input type to text.
    await expect(passwordInput).toHaveAttribute('type', 'text');
    // Verify that the revealed input still contains the entered password.
    await expect(passwordInput).toHaveValue('Test@1234');

    // Click the control that masks the password again.
    await page.getByRole('button', { name: 'Hide password' }).click();
    // Verify that the password input is masked again.
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('TC9: opens the forgot-password page', async ({ page }) => {
    // Follow the Forgot Password link.
    await page.getByRole('link', { name: 'Forgot Password?' }).click();

    // Verify navigation to the forgot-password page.
    await expect(page).toHaveURL(/\/forgot-password$/);
    // Verify that the password-reset page heading is visible.
    await expect(page.getByText('Reset Your Password', { exact: true })).toBeVisible();
  });

  test('TC10: opens the sign-up service-selection page', async ({ page }) => {
    // Follow the Sign up link.
    await page.getByRole('link', { name: 'Sign up' }).click();

    // Verify navigation to the service-selection page.
    await expect(page).toHaveURL(/\/select-service$/);
    // Verify that the service-selection page heading is visible.
    await expect(page.getByText('Select a Service')).toBeVisible();
  });

  test('TC11: switches the login page between English and Arabic', async ({ page }) => {
    // Switch the login page language from English to Arabic.
    await page.getByRole('button', { name: 'Toggle language' }).click();
    // Verify that the Arabic welcome heading is displayed.
    await expect(page.getByText('مرحبًا بك في إدارة الشركة')).toBeVisible();
    // Verify that the email field placeholder is displayed in Arabic.
    await expect(page.getByPlaceholder('أدخل البريد الإلكتروني')).toBeVisible();

    // Switch the login page language back to English.
    await page.getByRole('button', { name: 'Toggle language' }).click();
    // Verify that the English welcome heading is displayed again.
    await expect(page.getByText('Welcome to Company Admin')).toBeVisible();
  });
});
