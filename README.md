# Critter – Unified Automation Framework

<p align="center"><img width="520" height="520" alt="critter" src="https://github.com/user-attachments/assets/f6e59ef4-bd88-4b77-92e3-0ddad055c1e8" /></p>


Critter is an enterprise‑grade automation framework designed to test web, API, and mobile applications in a cloud‑agnostic manner. It combines the power of [Playwright](https://playwright.dev/) for web and API testing with [WebdriverIO](https://webdriver.io/) and [Appium](https://appium.io/) for mobile testing. The framework supports running against local device farms as well as cloud providers such as BrowserStack and Sauce Labs.

## Features

- **Environment agnostic** – select `dev`, `staging` or `prod` via `TEST_ENVIRONMENT` and the framework loads the correct configuration.
- **Cloud agnostic** – run tests on your own Selenium Grid/Appium servers or on BrowserStack/Sauce Labs.
- **Modular architecture** – providers implement a common interface and are created via a factory, following adapter and factory design patterns
- **API, UI and mobile support** – unified test runner coordinates Playwright and WebDriverIO sessions.
- **TypeScript first** – strict typing via `tsconfig.json` and easy compile with `npm run build`.

## Project Structure

```
critter/
├── COMMIT_GUIDELINES.md      # Commit message standards (Conventional Commits, DCO)
├── PR_GUIDELINES.md          # Pull request and contribution process
├── README.md                 # This file
├── package.json              # NPM dependencies and scripts
├── tsconfig.json             # TypeScript compiler settings
├── tsconfig.eslint.json      # ESLint TypeScript config
├── playwright.config.ts      # Playwright test configuration
├── commitlint.config.cjs     # Commit message linting rules
├── eslint.config.mjs         # ESLint configuration
├── lefthook.yml              # Git hooks configuration
├── config/                   # Environment and provider configs
│   ├── browserstack.config.ts
│   ├── saucelabs.config.ts
│   ├── local-farm.config.ts
│   ├── global.ts
│   └── environments/
│       ├── dev.ts
│       ├── prod.ts
│       └── staging.ts
├── dist/                     # Compiled JS output
│   └── ...
├── infrastructure/           # Infra as code (Docker, K8s, Terraform)
│   ├── docker/
│   ├── kubernetes/
│   ├── terraform/
│   └── README.md
├── reports/                  # Test reports (Allure, HTML, JSON)
│   ├── allure/
│   ├── html/
│   ├── json/
│   └── README.md
├── scripts/                  # Utility and CI scripts
│   ├── deploy-cloud.sh
│   ├── run-tests.sh
│   ├── setup-local-farm.sh
│   └── device-broker-tools/
│       └── registerDevice.ts
├── src/                      # Core framework (device broker, providers, API client, etc.)
│   └── framework/
│       ├── adapters/
│       ├── api/
│       ├── capabilities/
│       ├── core/
│       ├── providers/
│       └── shared/
├── tests/                    # Test layer (specs, page objects, mobile screens)
│   ├── api/
│   ├── fixtures/
│   ├── mobile/
│   └── ui/
└── test-results/             # Output from test runs
```

- The `src/` folder contains the reusable engine and core logic.
- The `tests/` folder contains your page objects, test specifications, and fixtures for API, UI, and mobile.
- The `config/` folder holds all environment and provider configuration files.
- The `infrastructure/` folder contains Docker, Kubernetes, and Terraform scripts for deployment and CI/CD.
- The `scripts/` folder provides helper scripts for setup, deployment, and device registration.
- The `reports/` folder aggregates test results in various formats.

## Getting Started

1. Copy `.env.example` to `.env` and fill in the appropriate values for your environments (base URLs, provider names, credentials).
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

## Development Standards & Contribution

- **Commit messages:** Follow [COMMIT_GUIDELINES.md](./COMMIT_GUIDELINES.md) (Conventional Commits, DCO sign-off required)
- **Pull requests:** Follow [PR_GUIDELINES.md](./PR_GUIDELINES.md) for submitting and reviewing PRs
- **Code style:** Enforced via ESLint and Prettier; run `npm run lint` before pushing
- **Testing:** Add/maintain tests for all new features and bug fixes
- **Documentation:** Update docs and examples for any user-facing changes
- **CI/CD:** All checks must pass before merge (lint, typecheck, tests, build)

## Contributing

This framework is a starting point. Contributions to add page objects, mobile screens, API services, and additional providers are welcome. Ensure that any new providers implement the `DeviceProvider` interface and register via `ProviderFactory`.

For detailed contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

All contributors are expected to follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## License

This project is licensed under the [MIT License](./LICENSE) © 2025 Suneel Kaushik Subramanya.

For more details, see the guidelines files in the project root. By contributing, you agree to follow the Code of Conduct and all project standards.
