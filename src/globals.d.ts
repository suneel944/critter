/*
 * Global type declarations for external modules used in the Critter framework.
 *
 * The container environment used for this assignment does not install third‑party
 * dependencies such as Playwright, WebdriverIO or Pino.  To allow the
 * TypeScript compiler to resolve imports from these packages without
 * generating errors, we provide minimal module declarations here.  Each
 * declaration exports the expected identifiers as type `any` so that
 * consuming code typechecks without requiring the actual packages.  When
 * running the project in a real environment, you should install the
 * corresponding dependencies to get proper typings and runtime behaviour.
 */

// dotenv only needs to be imported for its side effects; declare it as any.
declare module 'dotenv' {
  const dotenv: any;
  export default dotenv;
}

// Playwright test runner declarations.  We export the test and expect
// functions and a Page type as any.  Replace these declarations with
// actual Playwright types when the package is installed.
declare module '@playwright/test' {
  export const test: any;
  export const expect: any;
  export type Page = any;

  // Expose additional Playwright exports used in the configuration.  These
  // are stubbed as any so that imports like `devices` and types like
  // `PlaywrightTestConfig` don’t cause compile errors when Playwright is
  // not installed.
  export const devices: any;
  export type PlaywrightTestConfig = any;
  export const request: any;
  export type APIRequestContext = any;
  export type APIResponse = any;

  // API testing helpers exposed by Playwright.  These are stubbed as any
  // because the real types are unavailable in this environment.
  export const request: any;
  export type APIRequestContext = any;
  export type APIResponse = any;
}

// Pino logger.  The default export is typed as any.
declare module 'pino' {
  const pino: any;
  export default pino;
}

// WebdriverIO root module.  We declare the default export and any
// additional members as any.  This allows `import webdriverio from
// 'webdriverio'` without errors.
declare module 'webdriverio' {
  const webdriverio: any;
  export default webdriverio;

  // The remote function used to create WebdriverIO sessions.  Stubbed as any.
  export const remote: any;
}

// WDIO globals module exposes helper functions and objects like $, browser,
// describe and it.  We declare them as any to satisfy the compiler.  When
// running in a real WDIO environment these will be provided by the
// framework.
declare module '@wdio/globals' {
  export const $: any;
  export const browser: any;
  export const describe: any;
  export const it: any;
  export const expect: any;
}

// Declare chai exports for backwards compatibility.  We only need the
// expect function for assertions in sample tests.  In a real project you
// should use Playwright or WDIO’s assertion library instead.
declare module 'chai' {
  export const expect: any;
}