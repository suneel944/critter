import { Options } from '@wdio/types';

// WebDriverIO configuration for running mobile and web UI tests.  This file
// supports running against a local Appium server as well as BrowserStack or
// Sauce Labs.  Credentials and hostnames are read from environment variables.

export const config: Options.Testrunner = {
  runner: 'local',
  specs: ['./tests/mobile/specs/**/*.ts'],
  maxInstances: 1,
  logLevel: 'info',
  bail: 0,
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },
  services: [
    // Local Appium server
    ['appium', {
      // Use the default Appium install on your system; you can override
      // command and args here if needed
      command: 'appium',
      args: {
        // `--relaxed-security` is required for some cross‑origin features
        relaxedSecurity: true
      }
    }],
    // BrowserStack cloud service.  Only used when provider=browserstack
    ['browserstack', {
      user: process.env.BROWSERSTACK_USER,
      key: process.env.BROWSERSTACK_KEY,
      browserstackLocal: process.env.BROWSERSTACK_LOCAL === 'true'
    }],
    // Sauce Labs cloud service.  Only used when provider=saucelabs
    ['sauce', {
      user: process.env.SAUCE_USERNAME || process.env.SAUCE_USER,
      key: process.env.SAUCE_ACCESS_KEY || process.env.SAUCE_KEY,
      region: process.env.SAUCE_REGION || 'us-west-1',
      sauceConnect: process.env.SAUCE_CONNECT === 'true'
    }]
  ],
  // Before hook registers ts-node to compile TypeScript test files on the fly
  before: function() {
    require('ts-node').register({ files: true });
  }
};

export default config;