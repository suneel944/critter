import { remote } from "webdriverio";
import type { Browser } from "webdriverio";
import { IAdapter } from "./IAdapter";
import { WebdriverIOConfig } from "@wdio/types/build/Capabilities";

/**
 * Adapter that drives **Appium** sessions via **WebdriverIO** (standalone mode).
 *
 * @remarks
 * - Implements the {@link IAdapter} contract to unify with other adapters (e.g. Playwright).
 * - Supports both:
 *   - **init flows**: create a fresh WDIO session using `init()`.
 *   - **provider flows**: adopt an existing session using `bind()`.
 * - Provides a minimal set of **tool-agnostic actions** through `execute()`.
 * - Gracefully cleans up sessions with `teardown()`.
 *
 * ## Example
 * ```ts
 * const adapter = new AppiumAdapter()
 * await adapter.init({
 *   hostname: '127.0.0.1',
 *   port: 4723,
 *   path: '/',
 *   capabilities: {
 *     platformName: 'Android',
 *     'appium:automationName': 'UiAutomator2',
 *     'appium:deviceName': 'Android Emulator',
 *     'appium:app': '/path/to/app.apk'
 *   }
 * } satisfies WebdriverIOConfig)
 *
 * await adapter.execute('tap', { selector: 'xpath=//android.widget.TextView[@text="Views"]' })
 * await adapter.teardown()
 * ```
 */
export class AppiumAdapter implements IAdapter {
  /**
   * Underlying WebdriverIO browser/session instance.
   * Set by {@link init} or {@link bind}.
   */
  private driver?: Browser;

  /**
   * Create a new WebdriverIO session using the provided options.
   *
   * @param options - WebdriverIO remote options including Appium `capabilities`.
   *   Typically includes host/port/path and W3C caps with `appium:` vendor keys.
   *
   * @example
   * ```ts
   * await adapter.init({
   *   hostname: 'localhost',
   *   port: 4723,
   *   path: '/',
   *   capabilities: {
   *     platformName: 'iOS',
   *     'appium:automationName': 'XCUITest',
   *     'appium:deviceName': 'iPhone 15',
   *     'appium:app': '/path/to/My.app'
   *   }
   * } as WebdriverIOConfig)
   * ```
   *
   * @throws If `options.capabilities` is missing.
   */
  async init(options: WebdriverIOConfig): Promise<void> {
    if (!options?.capabilities) {
      throw new Error("AppiumAdapter.init requires options.capabilities");
    }
    this.driver = await remote(options);
  }

  /**
   * Bind to an existing WebdriverIO session (provided by a device/provider broker).
   *
   * @param session - Object containing an existing `driver`.
   *
   * @remarks
   * - Useful when sessions are created outside this adapter (e.g. Broker, Provider).
   * - Prevents duplicate session creation.
   *
   * @example
   * ```ts
   * const driver = await remote(opts) // created elsewhere
   * await adapter.bind({ driver })
   * ```
   *
   * @throws If `session.driver` is undefined.
   */
  async bind(session: { driver?: Browser }): Promise<void> {
    if (!session?.driver)
      throw new Error("AppiumAdapter.bind requires { driver }");
    this.driver = session.driver;
  }

  /**
   * Navigate to an absolute URL.
   *
   * @param target - Absolute URL to open (e.g., `https://example.com`).
   *
   * @remarks
   * - Primarily used in **mobile-web** or **webview** contexts.
   * - No-op in pure native flows unless explicitly invoked.
   *
   * @example
   * ```ts
   * await adapter.navigate('https://example.com')
   * ```
   */
  async navigate(target: string): Promise<void> {
    this.ensureStarted();
    await this.driver!.url(target);
  }

  /**
   * Execute a high-level UI/mobile action.
   *
   * ### Supported actions
   * - **`'tap'`** — `{ selector }`
   * - **`'setValue'`** — `{ selector, value }`
   * - **`'getText'`** — `{ selector }` → `string`
   * - **`'launchApp'`** — `{ appId }` (Appium mobile command)
   * - **`'terminateApp'`** — `{ appId }` (Appium mobile command)
   *
   * @param action - Name of the high-level action.
   * @param params - Action parameters (shape depends on the action).
   * @returns Result of the action (e.g. `string` for `getText`).
   *
   * @example Tap:
   * ```ts
   * await adapter.execute('tap', { selector: 'aid=Login' })
   * ```
   *
   * @example Type into a field:
   * ```ts
   * await adapter.execute('setValue', { selector: '#email', value: 'user@example.com' })
   * ```
   *
   * @example Launch / terminate app:
   * ```ts
   * await adapter.execute('launchApp', { appId: 'com.example.myapp' })
   * await adapter.execute('terminateApp', { appId: 'com.example.myapp' })
   * ```
   *
   * @throws If the action name is unsupported or required params are missing.
   */

  async execute(
    action: string,
    params?: { selector?: string; value?: string; appId?: string },
  ): Promise<unknown> {
    this.ensureStarted();

    switch (action) {
      case "tap": {
        if (!params?.selector) throw new Error("tap: selector required");
        const el = this.driver!.$(params.selector);
        return el.click();
      }
      case "setValue": {
        if (!params?.selector || params.value === undefined) {
          throw new Error("setValue: selector & value required");
        }
        const el = this.driver!.$(params.selector);
        return el.setValue(params.value);
      }
      case "getText": {
        if (!params?.selector) throw new Error("getText: selector required");
        const el = this.driver!.$(params.selector);
        return el.getText();
      }
      case "launchApp": {
        if (!params?.appId) throw new Error("launchApp: appId required");
        return this.driver!.execute("mobile: launchApp", {
          appId: params.appId,
        });
      }
      case "terminateApp": {
        if (!params?.appId) throw new Error("terminateApp: appId required");
        return this.driver!.execute("mobile: terminateApp", {
          appId: params.appId,
        });
      }
      default:
        throw new Error(
          `AppiumAdapter.execute: unsupported action "${action}"`,
        );
    }
  }

  /**
   * Gracefully end the session if one exists.
   *
   * @remarks
   * - Safe to call multiple times.
   * - Silently ignores errors if the session is already closed.
   *
   * @example
   * ```ts
   * await adapter.teardown()
   * ```
   */
  async teardown(): Promise<void> {
    if (this.driver) {
      await this.driver.deleteSession().catch(() => void 0);
      this.driver = undefined;
    }
  }

  /**
   * Ensure the WDIO session exists before use.
   *
   * @throws If called before {@link init} or {@link bind}.
   * @internal
   */
  private ensureStarted(): void {
    if (!this.driver) {
      throw new Error(
        "AppiumAdapter: driver not started. Call init() or bind() first.",
      );
    }
  }
}
