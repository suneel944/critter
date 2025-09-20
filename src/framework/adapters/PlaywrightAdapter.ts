import { chromium, firefox, webkit } from "playwright";
import type {
  Browser,
  BrowserContext,
  BrowserContextOptions,
  LaunchOptions,
  Page,
} from "playwright";
import { IAdapter } from "./IAdapter";

type PWBrowser = "chromium" | "firefox" | "webkit";

/**
 * Adapter for running local Playwright sessions.
 *
 * @remarks
 * - Implements {@link IAdapter} for consistency with other driver adapters.
 * - Supports launching Chromium, Firefox, and WebKit engines.
 * - Provides minimal, tool-agnostic actions via Playwright’s Locator API.
 * - Can bind to an existing browser, context, or page session provided by a broker.
 */
export class PlaywrightAdapter implements IAdapter {
  private browser!: Browser;
  private context!: BrowserContext;
  private page!: Page;

  /**
   * Start a new Playwright session.
   *
   * @param options - Configuration for browser launch and context.
   * @param options.browser - Engine to launch (`chromium` | `firefox` | `webkit`).
   * @param options.launchOptions - Extra options for {@link Browser.launch}.
   * @param options.contextOptions - Extra options for {@link Browser.newContext}.
   *
   * @remarks
   * - Launches the requested browser engine.
   * - Creates a new isolated {@link BrowserContext}.
   * - Opens a fresh {@link Page}.
   */
  async init(options?: {
    browser?: PWBrowser;
    launchOptions?: LaunchOptions;
    contextOptions?: BrowserContextOptions;
  }): Promise<void> {
    const kind = options?.browser ?? "chromium";
    const engines = { chromium, firefox, webkit } as const;
    const engine = engines[kind];

    this.browser = await engine.launch(options?.launchOptions);
    this.context = await this.browser.newContext(options?.contextOptions);
    this.page = await this.context.newPage();
  }

  /**
   * Bind to an existing Playwright session.
   *
   * @param session - Existing session handles.
   *   - `{ page }` → binds to a given page and infers context/browser.
   *   - `{ context }` → binds to a given context and creates a new page.
   *   - `{ browser }` → binds to a given browser and creates context + page.
   *
   * @throws If provided handles are invalid (e.g. context has no browser).
   */
  async bind(session: {
    page?: Page;
    context?: BrowserContext;
    browser?: Browser;
  }): Promise<void> {
    if (session.page) {
      this.page = session.page;
      const ctx = this.page.context();
      const br = ctx.browser();
      if (!br) throw new Error("PlaywrightAdapter.bind: page has no browser");
      this.context = ctx;
      this.browser = br;
      return;
    }
    if (session.context) {
      this.context = session.context;
      const br = this.context.browser();
      if (!br)
        throw new Error("PlaywrightAdapter.bind: context has no browser");
      this.browser = br;
      this.page = await this.context.newPage();
      return;
    }
    if (session.browser) {
      this.browser = session.browser;
      this.context = await this.browser.newContext();
      this.page = await this.context.newPage();
      return;
    }
    throw new Error(
      "PlaywrightAdapter.bind requires { page } or { context } or { browser }",
    );
  }

  /**
   * Navigate to a given URL.
   *
   * @param url - Target URL to load.
   * @remarks
   * Waits for the DOM content to be fully loaded.
   */
  async navigate(url: string): Promise<void> {
    this.ensureReady();
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  /**
   * Execute a minimal action using Playwright’s Locator API.
   *
   * @param action - Action keyword.
   * @param params - Action-specific parameters.
   *
   * @remarks
   * Supported actions:
   * - `"click"` — `{ selector }`
   * - `"fill"` — `{ selector, value }`
   * - `"type"` — `{ selector, text, delayMs? }` (per-character typing if delay > 0, otherwise fast fill)
   * - `"getText"` — `{ selector }` → returns string
   * - `"waitForSelector"` — `{ selector, state?, timeoutMs? }` → returns `true` on success
   * - `"screenshot"` — `{ path?, fullPage? }` → returns `Buffer`
   * - `"title"` → returns string
   * - `"url"` → returns string
   *
   * @throws If the action keyword is unsupported or parameters are invalid.
   */
  async execute(action: string, params?: unknown): Promise<unknown> {
    this.ensureReady();

    switch (action) {
      case "click": {
        const { selector } = as<{ selector: string }>(params);
        await this.page.locator(selector).click();
        return;
      }

      case "fill": {
        const { selector, value } = as<{ selector: string; value: string }>(
          params,
        );
        await this.page.locator(selector).fill(value);
        return;
      }

      case "type": {
        const { selector, text, delayMs } = as<{
          selector: string;
          text: string;
          delayMs?: number;
        }>(params);
        const loc = this.page.locator(selector);

        if (delayMs && delayMs > 0) {
          await loc.pressSequentially(text, { delay: delayMs });
        } else {
          await loc.fill(text);
        }
        return;
      }

      case "getText": {
        const { selector } = as<{ selector: string }>(params);
        const text = await this.page.locator(selector).textContent();
        return text ?? "";
      }

      case "waitForSelector": {
        const { selector, state, timeoutMs } = as<{
          selector: string;
          state?: "attached" | "detached" | "visible" | "hidden";
          timeoutMs?: number;
        }>(params);
        await this.page
          .locator(selector)
          .waitFor({ state: state ?? "visible", timeout: timeoutMs });
        return true;
      }

      case "screenshot": {
        const { path, fullPage } = as<{ path?: string; fullPage?: boolean }>(
          params ?? {},
        );
        return this.page.screenshot({ path, fullPage: !!fullPage });
      }

      case "title":
        return this.page.title();

      case "url":
        return this.page.url();

      default:
        throw new Error(
          `PlaywrightAdapter.execute: unsupported action "${action}"`,
        );
    }
  }

  /**
   * Tear down the session.
   *
   * @remarks
   * Closes page → context → browser in order.
   * Safe to call multiple times; ignores errors if already closed.
   */
  async teardown(): Promise<void> {
    try {
      await this.page?.close();
    } catch {}
    try {
      await this.context?.close();
    } catch {}
    try {
      await this.browser?.close();
    } catch {}
  }

  /**
   * Ensure session has been started or bound before use.
   *
   * @throws If browser, context, or page are missing.
   */
  private ensureReady(): void {
    if (!this.page || !this.context || !this.browser) {
      throw new Error(
        "PlaywrightAdapter: not started. Call init() or bind() first.",
      );
    }
  }

  /**
   * Get the underlying Playwright {@link Page}.
   *
   * @returns The current page instance.
   */
  public getPage(): Page {
    this.ensureReady();
    return this.page;
  }
}

/**
 * Tiny helper to validate runtime params.
 *
 * @typeParam T - Expected object shape.
 * @param v - Value to assert as object.
 * @returns Value typed as `T`.
 * @throws If `v` is not a plain object.
 */
function as<T extends object>(v: unknown): T {
  if (!v || typeof v !== "object") throw new Error("Invalid parameters");
  return v as T;
}
