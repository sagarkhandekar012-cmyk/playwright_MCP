import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { test, expect } from '@playwright/test';

type LoginData = {
  Username: string;
  Password: string;
  Expected: 'Dashboard' | 'Invalid credentials';
};

const loginUrl = 'https://opensource-demo.orangehrmlive.com/';
const loginDataPath = path.resolve(__dirname, '..', 'test_data', 'loginData.csv');

const loginData = parse(readFileSync(loginDataPath, 'utf8'), {
  columns: true,
  skip_empty_lines: true,
  trim: true,
}) as LoginData[];

test.describe('OrangeHRM login validation - CSV data driven', () => {
  test.afterEach(async ({}, testInfo) => {
    console.log(`${testInfo.status === 'passed' ? 'PASS' : 'FAIL'}: ${testInfo.title}`);
  });

  for (const data of loginData) {
    test(`login with ${data.Username} expects ${data.Expected}`, async ({ page }) => {
      await page.goto(loginUrl);

      await page.getByRole('textbox', { name: 'Username' }).fill(data.Username);
      await page.getByRole('textbox', { name: 'Password' }).fill(data.Password);
      await page.getByRole('button', { name: 'Login', exact: true }).click();

      if (data.Expected === 'Dashboard') {
        await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
      } else {
        await expect(page.getByText('Invalid credentials', { exact: true })).toBeVisible();
      }
    });
  }
});
