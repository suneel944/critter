/**
 * DeviceProvider defines an abstraction for obtaining browser or device sessions.
 *
 * The goal of a provider is to hide the underlying implementation details (local
 * Selenium Grid, BrowserStack or SauceLabs) from the rest of the framework.  By
 * exposing a common API for acquiring and releasing drivers, the test code
 * becomes agnostic to where the tests run.  This design follows the Adapter
 * pattern, allowing incompatible provider implementations to be used through a
 * unified interface.
 */
export interface DeviceProvider {
  /**
   * A human‑friendly name for the provider (e.g. "local", "browserstack").
   */
  readonly name: string;

  /**
   * Optional one‑time initialisation.  Providers can use this hook to start
   * services or authenticate before any sessions are created.  It should be
   * idempotent so that multiple calls have no side effects.
   */
  init(): Promise<void>;

  /**
   * Acquire a WebDriver session for web tests.  The returned object can be a
   * Playwright `Browser` instance or a WebDriverIO session depending on the
   * provider.  Consumers should not depend on the concrete type but use the
   * APIs exposed by the page objects.
   *
   * @param capabilities optional desired capabilities or options for the
   *   underlying driver.  See provider implementations for supported fields.
   */
  getWebDriver(capabilities?: Record<string, any>): Promise<any>;

  /**
   * Acquire a mobile driver session for native or hybrid apps.  For providers
   * that do not support mobile testing, this method may throw.
   *
   * @param capabilities optional desired capabilities such as platformName,
   *   deviceName, app, etc.
   */
  getMobileDriver(capabilities?: Record<string, any>): Promise<any>;

  /**
   * Release a previously acquired session.  This method allows providers to
   * cleanly close sessions and return resources to the pool.
   *
   * @param driver the driver instance returned by getWebDriver or
   *   getMobileDriver.
   */
  releaseDriver(driver: any): Promise<void>;

  /**
   * Perform any provider level clean up.  Called once when the framework is
   * shutting down.  Providers should free resources like tunnels or local
   * devices here.
   */
  cleanup(): Promise<void>;
}