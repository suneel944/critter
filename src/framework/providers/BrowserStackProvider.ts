import { remote, type Browser } from 'webdriverio'

import { toBuilder, buildCaps, mergeVendor, detectPlatformFromCaps } from '../capabilities/_caps'
import ConfigManager from '../config/ConfigManager'
import Logger from '../logging/Logger'
import type { IDeviceProvider, MobileCapsInput, Platform } from '../shared/ports/IDeviceProvider'

/**
 * Provider implementation for BrowserStack.
 *
 * - Creates remote sessions on BrowserStack's cloud grid using WebdriverIO.
 * - Supports **mobile testing** (Android/iOS) through Appium capabilities.
 * - Automatically merges framework defaults and vendor-specific options
 *   (`bstack:options`) while preserving caller-supplied values.
 *
 * This provider is designed for use inside Critter’s `DeviceBroker`.
 */
export class BrowserStackProvider implements IDeviceProvider {
  /** Logical name of the provider, used in factory selection. */
  public readonly name = 'browserstack'

  private readonly user: string
  private readonly key: string
  private readonly region: string
  private readonly browserstackLocal: boolean

  /**
   * Reads BrowserStack credentials and settings from `ConfigManager`,
   * falling back to environment variables:
   *  BROWSERSTACK_USER, BROWSERSTACK_KEY, BROWSERSTACK_REGION, BROWSERSTACK_LOCAL
   */
  constructor() {
    const cfg = ConfigManager.getInstance().getAll() as Record<string, unknown>
    this.user = (cfg['user'] as string)
    this.key = (cfg['key'] as string)
    this.region = (cfg['region'] as string)
    this.browserstackLocal = (cfg['local'] as boolean)
  }

  /**
   * Initialize provider resources.
   * For BrowserStack this is a no-op, but the hook exists for future
   * setup (e.g. starting BrowserStack Local binaries).
   */
  async init(): Promise<void> {
    Logger.debug('Initialising BrowserStackProvider')
  }

  /**
   * Acquire a new **mobile driver session** on BrowserStack.
   *
   * @param caps - Input capabilities or builder describing the target
   *               mobile device and app under test.
   *               The framework auto-detects platform (Android/iOS).
   * @returns A wrapped session containing the active WebdriverIO `Browser`.
   */
  async getMobileDriver(caps: MobileCapsInput): Promise<{ driver: Browser }> {
    const platform: Platform = detectPlatformFromCaps(caps as Record<string, unknown>)
    const builder = toBuilder(caps, platform)

    // Merge vendor-specific options. Caller options always win on conflict.
    mergeVendor(builder, 'bstack:options', {
      local: this.browserstackLocal,
      buildName: 'critter-build',
      sessionName: platform === 'ios' ? 'iOS Mobile Test' : 'Android Mobile Test',
      appiumVersion: '2.0.0',
    })

    const capabilities = buildCaps(builder)
    const host = this.region ? `${this.region}.browserstack.com` : 'hub.browserstack.com'

    Logger.info(`${platform}: Acquiring BrowserStack mobile session`)
    const driver = await remote({
      protocol: 'https',
      hostname: host,
      port: 443,
      path: '/wd/hub',
      user: this.user,
      key: this.key,
      capabilities,
    })

    return { driver }
  }

  /**
   * Release a running BrowserStack session.
   *
   * @param driver - The WebdriverIO `Browser` instance to terminate.
   */
  async releaseDriver(driver: Browser): Promise<void> {
    if (driver && typeof driver.deleteSession === 'function') {
      Logger.debug('Releasing BrowserStack session')
      await driver.deleteSession()
    }
  }

  /**
   * Clean up provider resources.
   * For BrowserStack this is currently a no-op, but may include
   * stopping BrowserStack Local or flushing caches.
   */
  async cleanup(): Promise<void> {
    Logger.debug('Cleaning up BrowserStackProvider')
  }
}
