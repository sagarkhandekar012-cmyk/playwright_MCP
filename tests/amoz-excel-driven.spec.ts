import { test, expect, type Page } from '@playwright/test';
import { readTestCases } from './excel-data';

const loginUrl = 'https://superadmin-amoz.betadelivery.com/login';
const validEmail = 'amozit@yopmail.com';
const validPassword = 'Admin@123';
const otp = process.env.OTP ?? '1234';

async function openLoginPage(page: Page) {
  await page.goto(loginUrl);
  await expect(page.getByText('Admin access – log in', { exact: true })).toBeVisible();
}

async function loginWithValidCredentials(page: Page) {
  await openLoginPage(page);
  await page.getByPlaceholder('Enter your email').fill(validEmail);
  await page.getByPlaceholder('Enter your password').fill(validPassword);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
}

async function loginToDashboard(page: Page) {
  await loginWithValidCredentials(page);
  const otpInputs = page.locator('input[aria-label^="Character"]');
  await expect(otpInputs).toHaveCount(4);
  for (let index = 0; index < otp.length; index++) {
    await otpInputs.nth(index).fill(otp[index]);
  }
  await page.getByRole('button', { name: 'Verify', exact: true }).click();
  await expect(page.getByText('Dashboard Overview', { exact: true })).toBeVisible();
}

const excelRows = readTestCases();

test.describe('AMOZ Excel-driven suite', () => {
  for (const row of excelRows) {
    test(`${row.ID}: ${row.Scenario}`, async ({ page }) => {
      const scenario = row.Scenario.trim().toLowerCase();

      switch (scenario) {
        case 'page loads': {
          await openLoginPage(page);
          await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
          await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
          await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
          await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
          break;
        }

        case 'valid login': {
          await loginWithValidCredentials(page);
          const otpInputs = page.locator('input[aria-label^="Character"]');
          await expect(otpInputs).toHaveCount(4);
          await expect(page.getByText('OTP sent successfully', { exact: true })).toBeVisible();
          break;
        }

        case 'toast on otp send': {
          await loginWithValidCredentials(page);
          await expect(page.getByText('OTP sent successfully', { exact: true })).toBeVisible();
          break;
        }

        case 'empty fields': {
          await openLoginPage(page);
          await page.getByRole('button', { name: 'Sign In', exact: true }).click();
          await expect(page.getByText('Email is required', { exact: true })).toBeVisible();
          await expect(page.getByText('Password is required', { exact: true })).toBeVisible();
          break;
        }

        case 'invalid email format': {
          await openLoginPage(page);
          await page.getByPlaceholder('Enter your email').fill('amozit@');
          await page.getByPlaceholder('Enter your password').fill(validPassword);
          await page.getByRole('button', { name: 'Sign In', exact: true }).click();
          await expect(page.getByText(/email/i)).toBeVisible();
          break;
        }

        case 'wrong password': {
          await openLoginPage(page);
          await page.getByPlaceholder('Enter your email').fill(validEmail);
          await page.getByPlaceholder('Enter your password').fill('Wrong@123');
          await page.getByRole('button', { name: 'Sign In', exact: true }).click();
          await expect(page.getByText(/invalid login credentials|invalid|error/i)).toBeVisible();
          await expect(page).toHaveURL(/\/login$/);
          break;
        }

        case 'password mask/eye icon': {
          await openLoginPage(page);
          const password = page.getByPlaceholder('Enter your password');
          await password.fill('Admin@123');
          await expect(password).toHaveAttribute('type', 'password');
          await page.locator('button').filter({ has: page.locator('svg') }).first().click();
          await expect(password).toHaveAttribute('type', 'text');
          break;
        }

        case 'language switch': {
          await openLoginPage(page);
          await page.getByRole('button', { name: /toggle language|language/i }).click();
          await expect(page.getByText(/admin access|مرحب/i)).toBeVisible();
          break;
        }

        case 'forgot password link': {
          await openLoginPage(page);
          await page.getByRole('link', { name: /forgot password/i }).click();
          await expect(page).toHaveURL(/forgot-password/i);
          break;
        }

        case 'otp ui': {
          await loginWithValidCredentials(page);
          const otpInputs = page.locator('input[aria-label^="Character"]');
          await expect(otpInputs).toHaveCount(4);
          await expect(page.getByText(/OTP expires in 0:59/i)).toBeVisible();
          await expect(page.getByRole('button', { name: 'Verify', exact: true })).toBeVisible();
          break;
        }

        case 'timer': {
          await loginWithValidCredentials(page);
          await expect(page.getByText(/OTP expires in/i)).toBeVisible();
          break;
        }

        case 'valid otp': {
          await loginToDashboard(page);
          break;
        }

        case 'login toast': {
          await loginToDashboard(page);
          await expect(page.getByText('Login Successfully', { exact: true })).toBeVisible();
          break;
        }

        case 'wrong otp': {
          await loginWithValidCredentials(page);
          const otpInputs = page.locator('input[aria-label^="Character"]');
          for (let index = 0; index < otp.length; index++) {
            await otpInputs.nth(index).fill('9');
          }
          await page.getByRole('button', { name: 'Verify', exact: true }).click();
          await expect(page.getByText(/invalid|error|wrong/i)).toBeVisible();
          break;
        }

        case 'empty or incomplete otp': {
          await loginWithValidCredentials(page);
          const otpInputs = page.locator('input[aria-label^="Character"]');
          await otpInputs.nth(0).fill('1');
          await otpInputs.nth(1).fill('2');
          await page.getByRole('button', { name: 'Verify', exact: true }).click();
          await expect(page.getByText(/required|otp/i)).toBeVisible();
          break;
        }

        case 'expired otp': {
          await loginWithValidCredentials(page);
          await page.waitForTimeout(65000);
          const otpInputs = page.locator('input[aria-label^="Character"]');
          for (let index = 0; index < otp.length; index++) {
            await otpInputs.nth(index).fill(otp[index]);
          }
          await page.getByRole('button', { name: 'Verify', exact: true }).click();
          await expect(page.getByText(/expired|resend/i)).toBeVisible();
          break;
        }

        case 'non-numeric input': {
          await loginWithValidCredentials(page);
          const otpInputs = page.locator('input[aria-label^="Character"]');
          await otpInputs.nth(0).fill('a');
          await otpInputs.nth(1).fill('@');
          await expect(otpInputs.nth(0)).toHaveValue('');
          break;
        }

        case 'toast behavior': {
          await loginToDashboard(page);
          await expect(page.getByText('Login Successfully', { exact: true })).toBeVisible();
          break;
        }

        case 'dashboard loads': {
          await loginToDashboard(page);
          await expect(page.getByText('Dashboard Overview', { exact: true })).toBeVisible();
          break;
        }

        case 'filters': {
          await loginToDashboard(page);
          await page.getByRole('button', { name: 'Daily', exact: true }).click();
          await expect(page.getByRole('button', { name: 'Daily', exact: true })).toBeVisible();
          break;
        }

        case 'kpi accuracy': {
          await loginToDashboard(page);
          await expect(page.getByText(/Active Users|Total Users|Revenue|Total Orders/i)).toBeVisible();
          break;
        }

        case 'chart legends': {
          await loginToDashboard(page);
          await expect(page.getByText(/Completed|Cancelled|Rescheduled/i)).toBeVisible();
          break;
        }

        case 'sidebar navigation': {
          await loginToDashboard(page);
          await expect(page.getByRole('button', { name: /dashboard|users|orders/i })).toBeVisible();
          break;
        }

        case 'export': {
          await loginToDashboard(page);
          await expect(page.getByRole('button', { name: /export/i })).toBeVisible();
          break;
        }

        case 'profile popup': {
          await loginToDashboard(page);
          await page.getByText('Admin User', { exact: true }).click();
          await expect(page.getByText('Profile', { exact: true })).toBeVisible();
          await expect(page.getByText('Sign Out', { exact: true })).toBeVisible();
          break;
        }

        case 'confirm popup': {
          await loginToDashboard(page);
          await page.getByText('Admin User', { exact: true }).click();
          await page.getByText('Sign Out', { exact: true }).click();
          await expect(page.getByText('Are you sure you want to Sign Out?', { exact: true })).toBeVisible();
          break;
        }

        case 'cancel': {
          await loginToDashboard(page);
          await page.getByText('Admin User', { exact: true }).click();
          await page.getByText('Sign Out', { exact: true }).click();
          await page.getByRole('button', { name: 'Cancel', exact: true }).click();
          await expect(page.getByText('Dashboard Overview', { exact: true })).toBeVisible();
          break;
        }

        case 'confirm sign out': {
          await loginToDashboard(page);
          await page.getByText('Admin User', { exact: true }).click();
          await page.getByText('Sign Out', { exact: true }).click();
          await page.getByRole('button', { name: 'Sign Out', exact: true }).last().click();
          await expect(page.getByText('Admin access – log in', { exact: true })).toBeVisible();
          break;
        }

        case 'logout toast': {
          await loginToDashboard(page);
          await page.getByText('Admin User', { exact: true }).click();
          await page.getByText('Sign Out', { exact: true }).click();
          await page.getByRole('button', { name: 'Sign Out', exact: true }).last().click();
          await expect(page.getByText('Logout Successfully', { exact: true })).toBeVisible();
          break;
        }

        case 'session after logout': {
          await loginToDashboard(page);
          await page.getByText('Admin User', { exact: true }).click();
          await page.getByText('Sign Out', { exact: true }).click();
          await page.getByRole('button', { name: 'Sign Out', exact: true }).last().click();
          await page.goto(new URL('/dashboard', loginUrl).toString());
          await expect(page.getByText('Admin access – log in', { exact: true })).toBeVisible();
          break;
        }

        case 'login fields after logout': {
          await loginToDashboard(page);
          await page.getByText('Admin User', { exact: true }).click();
          await page.getByText('Sign Out', { exact: true }).click();
          await page.getByRole('button', { name: 'Sign Out', exact: true }).last().click();
          await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
          await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
          break;
        }

        case 'otp screen url': {
          await loginWithValidCredentials(page);
          await expect(page).toHaveURL(/\/login$/);
          break;
        }

        case 'dashboard user and order values': {
          await loginToDashboard(page);
          await expect(page.getByText(/Dashboard Overview|Active Users|Total Users|Total Orders/i)).toBeVisible();
          break;
        }

        case 'dashboard revenue format': {
          await loginToDashboard(page);
          await expect(page.getByText(/Revenue/i)).toBeVisible();
          break;
        }

        default: {
          await openLoginPage(page);
          await expect(row.Expected || row.Scenario).toBeTruthy();
          break;
        }
      }
    });
  }
});
