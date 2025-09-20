import ProviderFactory from "../core/ProviderFactory";
import type {
  IDeviceProvider,
  ProviderOptions,
  MobileSession,
} from "../providers/IDeviceProvider";
import { AppiumAdapter } from "../adapters/AppiumAdapter";
import type { IAdapter } from "../adapters/IAdapter";
import type { Browser } from "webdriverio";

/**
 * The `DeviceBroker` is the orchestration layer between providers
 * (BrowserStack, Sauce Labs, Local) and adapters (Appium).
 *
 * @remarks
 * - It ensures providers are **initialised once** before use.
 * - It exposes a high-level API to obtain either:
 *   - A bound {@link IAdapter} (preferred for most tests).
 *   - A raw {@link Browser} driver session (legacy or low-level cases).
 * - It manages the lifecycle of sessions (acquire, release, cleanup).
 *
 * This class shields client code from the details of provider selection,
 * driver instantiation, and adapter binding.
 */
export default class DeviceBroker {
  private provider: IDeviceProvider;
  private initialised = false;

  /**
   * Constructs a `DeviceBroker` by retrieving the correct provider
   * (local, BrowserStack, Sauce Labs) from {@link ProviderFactory}.
   */
  constructor() {
    this.provider = ProviderFactory.getProvider();
  }

  /**
   * Ensure the provider is initialised.
   *
   * @internal
   * Called before any session is created. Sets `initialised` to true
   * after the first call.
   */
  private async ensureInit(): Promise<void> {
    if (!this.initialised) {
      await this.provider.init();
      this.initialised = true;
    }
  }

  /**
   * Acquire a mobile session and return an Appium adapter bound to it.
   *
   * @param options - Provider-specific options or capabilities describing
   *                  the target mobile device/session.
   * @returns A fully bound {@link IAdapter} wrapping the driver session.
   *
   * @example
   * ```ts
   * const broker = new DeviceBroker()
   * const adapter = await broker.getMobileAdapter({ platformName: "Android" })
   * await adapter.tap("#loginButton")
   * ```
   */
  public async getMobileAdapter(options: ProviderOptions): Promise<IAdapter> {
    await this.ensureInit();
    const session: MobileSession = await this.provider.getMobileDriver(options);
    const adapter = new AppiumAdapter();
    await adapter.bind(session);
    return adapter;
  }

  /**
   * Acquire a raw mobile driver session without an adapter.
   *
   * @param options - Provider-specific options or capabilities.
   * @returns The {@link MobileSession}, containing the WebdriverIO `Browser`.
   *
   * @remarks
   * This method exists for legacy code or advanced cases where direct
   * WebdriverIO access is required. Prefer {@link getMobileAdapter}.
   */
  public async getMobileDriver(
    options: ProviderOptions,
  ): Promise<MobileSession> {
    await this.ensureInit();
    return this.provider.getMobileDriver(options);
  }

  /**
   * Release a driver session back to the provider/pool.
   *
   * @param driver - The WebdriverIO `Browser` instance to terminate.
   */
  public async releaseDriver(driver: Browser): Promise<void> {
    await this.provider.releaseDriver(driver);
  }

  /**
   * Clean up provider resources.
   *
   * @remarks
   * - Calls {@link IDeviceProvider.cleanup}.
   * - Safe to call multiple times (initialization is idempotent).
   */
  public async cleanup(): Promise<void> {
    await this.ensureInit();
    await this.provider.cleanup();
  }
}
