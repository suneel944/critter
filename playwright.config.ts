import { PlaywrightTestConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file if present.  This enables
// environment‑agnostic configuration; the test environment is selected via
// TEST_ENVIRONMENT and ConfigManager within the framework.
dotenv.config();

const config: PlaywrightTestConfig = {
  testDir: 'tests/ui/specs',
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { outputFolder: 'reports/html/playwright' }], ['list']],
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    // Accept self‑signed certificates on non‑prod environments
    ignoreHTTPSErrors: true
  },
  projects: [
    {
      name: 'ui unit',
      grep: /@unit-ui/,
      use: { ...devices },
      testMatch: '**/tests/ui/specs/sample.spec.ts'
    },
    {
      name: 'ui unit',
      grep: /@unit-ui/,
      use: { ...devices['Desktop Firefox'] },
      testMatch: '**/tests/ui/specs/sample.spec.ts'
    },
    {
      name: 'ui unit',
      grep: /@unit-ui/,
      use: { ...devices['Desktop Safari'] },
      testMatch: '**/tests/ui/specs/sample.spec.ts'
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  // Global setup could be used to perform login or load environment config
  // globalSetup: require.resolve('./tests/ui/globalSetup'),
};

export default config;