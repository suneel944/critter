import ProviderFactory from '../factories/ProviderFactory'
import type { IAdapter } from '../shared/ports/IAdapter'
import type {
  IDeviceProvider,
  MobileCapsInput,
  MobileSession,
} from '../shared/ports/IDeviceProvider'
import type { Browser } from 'webdriverio'

/**
 * Optional factory signature to keep a convenience `getMobileAdapter` without
 * coupling the Broker to any concrete AdapterFactory.
 */
export type CreateAdapter = (kind: 'appium' | 'playwright') => IAdapter

/**
 * DeviceBroker orchestrates provider selection, session lifecycle, and policies.
 *
 * Design goals:
 *  - no provider hard-coding in adapters/tests;
 *  - choose provider per request (health/quotas/cost policies can evolve);
 *  - initialize each provider once (idempotent);
 *  - expose sessions (preferred) and only optionally construct adapters via DI.
 */
export default class DeviceBroker {
  /** Track which providers we’ve initialized so we don’t re-init. */
  private readonly initialized = new WeakSet<IDeviceProvider>()
  /** Track providers we’ve actually used so cleanup is targeted. */
  private readonly used = new Set<IDeviceProvider>()

  /**
   * @param createAdapter Optional factory for convenience method `getMobileAdapter`.
   *                      If not supplied and you call `getMobileAdapter`, an error is thrown.
   *                      Tests/fixtures can pass: `(k) => AdapterFactory.create(k)`.
   */
  constructor(private readonly createAdapter?: CreateAdapter) {}

  /**
   * Choose a provider instance for this request.
   * Today: ProviderFactory decides from ConfigManager/env.
   * Tomorrow: inject a real policy that can pick per caps/health/quotas.
   */
  private getProvider(): IDeviceProvider {
    // NOTE: ProviderFactory internally caches singleton instances per name.
    const p = ProviderFactory.getProvider()
    this.used.add(p)
    return p
  }

  /** Ensure provider init is called exactly once per instance. */
  private async ensureInit(p: IDeviceProvider): Promise<void> {
    if (!this.initialized.has(p)) {
      await p.init()
      this.initialized.add(p)
    }
  }

  /**
   * Acquire a mobile driver session.
   * Prefer this API in fixtures; keep adapters unaware of providers.
   */
  public async getMobileSession(input: MobileCapsInput): Promise<MobileSession> {
    const provider = this.getProvider()
    await this.ensureInit(provider)
    return provider.getMobileDriver(input)
  }

  /** Legacy alias (kept for compatibility). */
  public async getMobileDriver(input: MobileCapsInput): Promise<MobileSession> {
    return this.getMobileSession(input)
  }

  /**
   * Release a session.
   * Accepts either the full MobileSession or the raw Browser (legacy).
   */
  public async release(session: MobileSession | { driver: Browser } | Browser): Promise<void> {
    const provider = this.getProvider()
    await this.ensureInit(provider)

    // Normalize to raw driver
    const driver: Browser =
      (session as MobileSession)?.driver
        ? (session as MobileSession).driver
        : (session as { driver: Browser })?.driver ?? (session as Browser)

    await provider.releaseDriver(driver)
  }

  /** Legacy helper for old call sites. Prefer `release(...)`. */
  public async releaseDriver(driver: Browser): Promise<void> {
    await this.release(driver)
  }

  /**
   * Convenience: acquire a session and return a bound Appium adapter.
   * This keeps existing call sites working without coupling the Broker
   * to any concrete AdapterFactory at compile time.
   */
  public async getMobileAdapter(input: MobileCapsInput): Promise<IAdapter> {
    if (!this.createAdapter) {
      throw new Error(
        'DeviceBroker.getMobileAdapter requires a createAdapter(factory) to be supplied in the constructor',
      )
    }
    const session = await this.getMobileSession(input)
    const adapter = this.createAdapter('appium')
    await adapter.bind(session)
    return adapter
  }

  /**
   * Clean up any providers we’ve used during this broker’s lifetime.
   * Safe to call multiple times.
   */
  public async cleanup(): Promise<void> {
    await Promise.all(
      Array.from(this.used, async (p) => {
        await this.ensureInit(p)
        await p.cleanup()
      }),
    )
  }
}
