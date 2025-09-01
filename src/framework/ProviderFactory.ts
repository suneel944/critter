import { DeviceProvider } from './providers/DeviceProvider';
import { LocalProvider } from './providers/LocalProvider';
import { BrowserStackProvider } from './providers/BrowserStackProvider';
import { SauceLabsProvider } from './providers/SauceLabsProvider';
import ConfigManager from './ConfigManager';

/**
 * ProviderFactory instantiates the appropriate DeviceProvider implementation
 * based on configuration.  It uses the Factory Method pattern to decouple
 * client code from the concrete classes used to create provider instances.
 */
export default class ProviderFactory {
  /**
   * Cache of previously created providers keyed by provider name.  This ensures
   * that each provider is a singleton within the framework and avoids
   * unnecessary re‑initialization.
   */
  private static instances: Map<string, DeviceProvider> = new Map();

  /**
   * Returns a DeviceProvider instance configured for the current environment.
   *
   * The provider name is read from the `provider` field of the environment
   * configuration (see ConfigManager).  If no provider is specified a
   * LocalProvider will be returned by default.
   */
  public static getProvider(): DeviceProvider {
    const config = ConfigManager.getInstance().getAll();
    const providerName = (config.provider || 'local').toLowerCase();

    if (ProviderFactory.instances.has(providerName)) {
      return ProviderFactory.instances.get(providerName)!;
    }

    let provider: DeviceProvider;
    switch (providerName) {
      case 'browserstack':
        provider = new BrowserStackProvider();
        break;
      case 'saucelabs':
      case 'sauce':
        provider = new SauceLabsProvider();
        break;
      case 'local':
      default:
        provider = new LocalProvider();
        break;
    }
    ProviderFactory.instances.set(providerName, provider);
    return provider;
  }
}