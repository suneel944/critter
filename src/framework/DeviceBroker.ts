import ProviderFactory from './ProviderFactory';
import { DeviceProvider } from './providers/DeviceProvider';

/**
 * DeviceBroker is the central point through which tests obtain device and
 * browser sessions.  It encapsulates the selected provider and exposes a
 * simplified API for acquiring and releasing drivers.  This class acts as a
 * facade over the underlying provider implementation and ensures that
 * lifecycle methods are properly invoked.
 */
export default class DeviceBroker {
  private provider: DeviceProvider;
  private initialised = false;

  constructor() {
    this.provider = ProviderFactory.getProvider();
  }

  /**
   * Initialise the underlying provider.  Should be called before any drivers
   * are acquired.  Idempotent.
   */
  public async init(): Promise<void> {
    if (!this.initialised) {
      await this.provider.init();
      this.initialised = true;
    }
  }

  /**
   * Obtain a web driver session.
   */
  public async getWebDriver(capabilities: Record<string, any> = {}): Promise<any> {
    await this.init();
    return this.provider.getWebDriver(capabilities);
  }

  /**
   * Obtain a mobile driver session.
   */
  public async getMobileDriver(capabilities: Record<string, any> = {}): Promise<any> {
    await this.init();
    return this.provider.getMobileDriver(capabilities);
  }

  /**
   * Release a previously obtained driver.
   */
  public async releaseDriver(driver: any): Promise<void> {
    await this.provider.releaseDriver(driver);
  }

  /**
   * Perform cleanup of provider resources.  Should be called once at the end of
   * test execution.
   */
  public async cleanup(): Promise<void> {
    await this.provider.cleanup();
  }
}