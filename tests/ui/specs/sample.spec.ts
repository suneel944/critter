import { test, expect } from '@playwright/test';

// Sample Playwright UI test.  This test simply navigates to the base URL and
// asserts that the page loads.  Replace with your own tests and page objects.

test('sample home page loads', { tag: ['@unit-ui']}, async function ({ page }: any) {
  await page.goto('/');
  await expect(page).toHaveTitle(/Example/);
});