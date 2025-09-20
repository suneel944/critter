import type { Browser } from "webdriverio";
import type {
  CapabilityBuilder,
  Caps,
} from "../capabilities/CapabilityBuilder";

/**
 * Generic key–value options bag for provider-specific configuration.
 * Typically merged into vendor capabilities or used by builders.
 */
export type ProviderOptions = Record<string, unknown>;

/**
 * A running mobile session, containing the active WebdriverIO `Browser` instance.
 * This wrapper type allows future expansion (e.g. session metadata).
 */
export type MobileSession = { driver: Browser };

/**
 * Supported mobile platforms that a provider can launch sessions for.
 */
export type Platform = "android" | "ios";

/**
 * Union of acceptable inputs for requesting a mobile driver session:
 *  - `ProviderOptions` raw key/value pairs
 *  - `Caps` strongly-typed Appium/WebdriverIO capability object
 *  - `CapabilityBuilder` fluent builder used inside the framework
 */
export type MobileCapsInput = ProviderOptions | Caps | CapabilityBuilder;

/**
 * Contract that all device providers (e.g. BrowserStack, Sauce Labs, Local Farm)
 * must implement in order to integrate with the Critter framework.
 *
 * Providers are responsible for establishing connections to their backends,
 * translating input capabilities into vendor-specific formats, and creating
 * WebdriverIO `Browser` sessions for mobile platforms.
 */
export interface IDeviceProvider {
  /**
   * Initialize provider resources, such as API clients or tunnels.
   * Called once before any driver requests are made.
   */
  init(): Promise<void>;

  /**
   * Acquire a new mobile driver session for the given capabilities.
   *
   * @param caps - Input capabilities or builder describing the target device/app.
   * @returns A `MobileSession` containing the active WebdriverIO `Browser`.
   */
  getMobileDriver(caps: MobileCapsInput): Promise<MobileSession>;

  /**
   * Release an existing mobile driver session.
   * Implementations must ensure the remote session is terminated cleanly.
   *
   * @param driver - The WebdriverIO `Browser` instance to shut down.
   */
  releaseDriver(driver: Browser): Promise<void>;

  /**
   * Clean up provider resources (close tunnels, clear caches, etc).
   * Called once after all sessions are finished.
   */
  cleanup(): Promise<void>;
}
