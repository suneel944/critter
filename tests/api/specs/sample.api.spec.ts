import { test, expect } from '@playwright/test';

// Sample API test using Playwright.  Demonstrates how to call an endpoint and
// assert the status code and response body.  Replace with your own API tests.

test('sample API returns JSON', async ({ request }: any) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.id).toBe(1);
});