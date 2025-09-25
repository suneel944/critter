import { remote } from 'webdriverio'

import { toBuilder, detectPlatformFromCaps, buildCaps, mergeVendor } from '../capabilities/_caps'
import ConfigManager from '../config/ConfigManager'
import Logger from '../logging/Logger'
import type { IDeviceProvider, MobileCapsInput, Platform } from '../shared/ports/IDeviceProvider'
import type { Browser } from 'webdriverio'

/**
 * Provider implementation for Sauce Labs.
 *
 * - Connects to Sauce Labs’ cloud grid using WebdriverIO.
 * - Supports **mobile testing** (Android/iOS) via Appium capabilities.
 * - Merges Critter framework defaults with vendor-specific `sauce:options`
 *   while preserving caller-supplied values.
 *
 * This provider is intended for running Critter against the
 * Sauce Labs device farm and supports Sauce Connect tunnels.
 */
export class SauceLabsProvider implements IDeviceProvider {
  /** Logical name of the provider, used in factory selection. */
  public readonly name = 'saucelabs'
  private readonly user: string
  private readonly key: string
  private readonly region: string
  private readonly sauceConnect: boolean
  private readonly sauceTunnelIdentifier: string

  /**
   * Reads Sauce Labs credentials and settings from `ConfigManager`
   * or environment variables:
   * - `SAUCE_USERNAME`
   * - `SAUCE_ACCESS_KEY`
   * - `SAUCE_REGION` (default: `us-west-1`)
   * - `SAUCE_CONNECT` (boolean flag for Sauce Connect tunnels)
   * - `SAUCE_TUNNEL_IDENTIFIER` (optional tunnel ID)
   */
  constructor() {
    const cfg = ConfigManager.getInstance().getAll() as Record<string, unknown>
    this.user = (cfg['user'] as string)
    this.key = (cfg['key'] as string)
    this.region = (cfg['region'] as string)
    this.sauceConnect = (cfg['connect'] as boolean)
    this.sauceTunnelIdentifier = (cfg['tunnelIdentifier'] as string)
  }

  /**
   * Initialize provider resources.
   * For Sauce Labs this is a no-op, but could later include validation
   * of credentials or starting a local Sauce Connect process.
   */
  async init(): Promise<void> {
    Logger.debug('Initialising SauceLabsProvider')
  }

  /**
   * Acquire a new **mobile driver session** on Sauce Labs.
   *
   * @param caps - Input capabilities or builder describing the target
   *               mobile device and app under test.
   * @returns A wrapped session containing the active WebdriverIO `Browser`.
   *
   * @remarks
   * - Uses `detectPlatformFromCaps` to infer Android vs iOS.
   * - Adds default `sauce:options` including build name, test name,
   *   and optional `tunnelIdentifier` if Sauce Connect is enabled.
   * - Caller-supplied caps always override defaults.
   */
  async getMobileDriver(caps: MobileCapsInput): Promise<{ driver: Browser }> {
    const platform: Platform = detectPlatformFromCaps(caps as Record<string, unknown>)
    const builder = toBuilder(caps, platform)

    mergeVendor(builder, 'sauce:options', {
      build: 'critter-build',
      name: platform === 'ios' ? 'iOS Mobile Test' : 'Android Mobile Test',
      tunnelIdentifier: this.sauceTunnelIdentifier,
    })

    const capabilities = buildCaps(builder)
    const host = `${this.region}.saucelabs.com`

    Logger.info(`${platform}: Acquiring Sauce Labs mobile session`)
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
   * Release a running Sauce Labs session.
   *
   * @param driver - The WebdriverIO `Browser` instance to terminate.
   */
  async releaseDriver(driver: Browser): Promise<void> {
    if (driver && typeof driver.deleteSession === 'function') {
      Logger.debug('Releasing Sauce Labs session')
      await driver.deleteSession()
    }
  }

  /**
   * Clean up provider resources.
   * For Sauce Labs this is a no-op, but may include stopping a
   * Sauce Connect tunnel or cleaning up temporary state.
   */
  async cleanup(): Promise<void> {
    Logger.debug('Cleaning up SauceLabsProvider')
  }
}
