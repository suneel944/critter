import { test, expect } from '@playwright/test';
import { ConfigManager } from '../../../src/framework';

const config = ConfigManager.getInstance()

// Sample Playwright UI test.  This test simply navigates to the base URL and
// asserts that the page loads.  Replace with your own tests and page objects.

test('sample home page loads', { tag: ['@unit-ui']}, async function ({ page }: any) {
  await page.goto(config.get('exampleBaseUrl'));
  await expect(page).toHaveTitle(/Example/);
});