# Critter – Unified Automation Framework

Critter is an enterprise‑grade automation framework designed to test web, API
and mobile applications in a cloud‑agnostic manner.  It combines the power
of [Playwright](https://playwright.dev/) for web and API testing with
[WebdriverIO](https://webdriver.io/) and [Appium](https://appium.io/) for mobile
testing.  The framework supports running against local device farms as well
as cloud providers such as BrowserStack and Sauce Labs.

## Features

* **Environment agnostic** – select `dev`, `staging` or `prod` via `TEST_ENVIRONMENT` and the framework loads the correct configuration.
* **Cloud agnostic** – run tests on your own Selenium Grid/Appium servers or on BrowserStack/Sauce Labs.
* **Modular architecture** – providers implement a common interface and are created via a factory, following adapter and factory design patterns【552692288223628†L8-L13】【731933878383636†L8-L13】.
* **API, UI and mobile support** – unified test runner coordinates Playwright and WebDriverIO sessions.
* **TypeScript first** – strict typing via `tsconfig.json` and easy compile with `npm run build`.

## Project Structure

```
critter/
├── package.json             # NPM dependencies and scripts
├── tsconfig.json            # TypeScript compiler settings
├── playwright.config.ts     # Playwright test configuration
├── wdio.conf.ts             # WebDriverIO/Appium configuration
├── .env.example             # Sample environment variables
├── README.md                # This file
├── src/                     # Core framework (device broker, providers, API client, etc.)
└── tests/                   # Test layer (specs, page objects, mobile screens)
```

The `src/` folder contains the reusable engine; the `tests/` folder (not yet
populated) will contain your page objects and test specifications.

## Getting Started

1. Copy `.env.example` to `.env` and fill in the appropriate values for your
   environments (base URLs, provider names, credentials).
2. Install dependencies (requires Node.js ≥ 16):

   ```sh
   npm install
   ```

3. Build the TypeScript sources:

   ```sh
   npm run build
   ```

4. Run UI tests with Playwright:

   ```sh
   npm run test:ui
   ```

5. Run API tests with Playwright:

   ```sh
   npm run test:api
   ```

6. Run mobile tests with WebdriverIO/Appium:

   ```sh
   npm run test:mobile
   ```

## Contributing

This framework is a starting point.  Contributions to add page objects, mobile
screens, API services and additional providers are welcome.  Ensure that any
new providers implement the `DeviceProvider` interface and register via
`ProviderFactory`.