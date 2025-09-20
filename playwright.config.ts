import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config()

const ALLURE_DIR = path.resolve(__dirname, 'reports/allure/allure-results')

export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { outputFolder: 'reports/html/playwright' }],
    ['list'],
    ['allure-playwright', { resultsDir: ALLURE_DIR,  }],
  ],
  use: {
    headless: process.env.HEADLESS === 'true',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  },
  projects: [
    // -------- API (runs once, no browsers involved) --------
    {
      name: 'api unit',
      testMatch: ['api/specs/**/*.spec.ts'],     // only API files
      grep: /@unit-api/,
    },

    // -------- UI (only UI files) --------
    {
      name: 'ui unit chromium',
      testMatch: ['ui/specs/**/*.spec.ts'],      // only UI files
      grep: /@unit-ui/,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'ui unit firefox',
      testMatch: ['ui/specs/**/*.spec.ts'],
      grep: /@unit-ui/,
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'ui unit webkit',
      testMatch: ['ui/specs/**/*.spec.ts'],
      grep: /@unit-ui/,
      use: { ...devices['Desktop Safari'] }
    },

    // If you keep these generic browser projects, scope them to UI too:
    { name: 'chromium', testMatch: ['ui/specs/**/*.spec.ts'], use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  testMatch: ['ui/specs/**/*.spec.ts'], use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   testMatch: ['ui/specs/**/*.spec.ts'], use: { ...devices['Desktop Safari'] } }
  ]
})
