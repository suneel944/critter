import { remote } from "webdriverio"
import type { Browser } from "webdriverio"
import type { IDeviceProvider, MobileCapsInput, Platform } from "./IDeviceProvider"
import ConfigManager from "../core/ConfigManager"
import Logger from "../shared/logger"
import { toBuilder, detectPlatformFromCaps, buildCaps } from "./_caps"

/**
 * Provider implementation for local environments.
 *
 * - Connects to a locally running **Selenium Grid** (for web) or
 *   **Appium server** (for mobile).
 * - Reads host/port/path configuration from environment variables,
 *   falling back to sensible defaults.
 *
 * Defaults:
 * - WebDriver: `localhost:4444/wd/hub`
 * - Appium: `localhost:4723/wd/hub`
 *
 * This provider is designed for running Critter against a developer
 * machine or an on-premise device farm.
 */
export class LocalProvider implements IDeviceProvider {
  /** Logical name of the provider, used in factory selection. */
  public readonly name = "local"
  private readonly appiumHost: string
  private readonly appiumPort: number
  private readonly appiumPath: string

  /**
   * Reads connection details for local WebDriver and Appium servers
   * from environment variables, with defaults if not set:
   * - `LOCAL_WEBDRIVER_HOST`, `LOCAL_WEBDRIVER_PORT`, `LOCAL_WEBDRIVER_PATH`
   * - `LOCAL_APPIUM_HOST`, `LOCAL_APPIUM_PORT`, `LOCAL_APPIUM_PATH`
   */
  constructor() {
    ConfigManager.getInstance().getAll()
    this.appiumHost = process.env.LOCAL_APPIUM_HOST || "localhost"
    this.appiumPort = Number.parseInt(process.env.LOCAL_APPIUM_PORT || "4723", 10)
    this.appiumPath = process.env.LOCAL_APPIUM_PATH || "/wd/hub"
  }

  /**
   * Initialize provider resources.
   * For local use this is a no-op, but may be extended in future
   * (e.g. verifying server availability).
   */
  async init(): Promise<void> {
    Logger.debug("Initializing LocalProvider")
  }

  /**
   * Acquire a new **local mobile driver session** via Appium.
   *
   * @param caps - Input capabilities or builder describing the target
   *               local device/emulator and app under test.
   * @returns A wrapped session containing the active WebdriverIO `Browser`.
   *
   * @remarks
   * - Uses `detectPlatformFromCaps` to infer whether the session is Android/iOS.
   * - Builds capabilities through the framework’s `CapabilityBuilder`.
   * - Connects to the local Appium host/port configured via environment variables.
   */
  async getMobileDriver(caps: MobileCapsInput): Promise<{ driver: Browser }> {
    Logger.info("Acquiring local mobile driver session")
    const platform: Platform = detectPlatformFromCaps((caps as Record<string, unknown>))
    const builder = toBuilder(caps, platform)
    const capabilities = buildCaps(builder)

    const driver = await remote({
      hostname: this.appiumHost,
      port: this.appiumPort,
      path: this.appiumPath,
      capabilities
    })
    return { driver }
  }

  /**
   * Release a running local WebDriver/Appium session.
   *
   * @param driver - The WebdriverIO `Browser` instance to terminate.
   */
  async releaseDriver(driver: Browser): Promise<void> {
    if (driver && typeof driver.deleteSession === "function") {
      Logger.debug("Releasing local driver session")
      await driver.deleteSession()
    }
  }

  /**
   * Clean up provider resources.
   * For local use this is a no-op, but could include tasks like
   * stopping emulators or clearing temp files.
   */
  async cleanup(): Promise<void> {
    Logger.debug("Cleaning up LocalProvider")
  }
}
