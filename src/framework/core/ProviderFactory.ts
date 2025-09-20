import { IDeviceProvider } from "../providers/IDeviceProvider"
import { LocalProvider } from "../providers/LocalProvider"
import { BrowserStackProvider } from "../providers/BrowserStackProvider"
import { SauceLabsProvider } from "../providers/SauceLabsProvider"
import ConfigManager from "../core/ConfigManager"

/**
 * Factory responsible for creating and returning {@link IDeviceProvider}
 * instances.
 *
 * @remarks
 * - Implements the **Factory Method** pattern to decouple client code from
 *   the concrete provider classes.
 * - Ensures provider instances are **singletons** within the framework by
 *   caching them in a static map.
 * - Selects the provider based on the active environment configuration
 *   (see {@link ConfigManager}).
 */
export default class ProviderFactory {
  /**
   * Cache of previously created providers, keyed by provider name.
   *
   * @internal
   * Used to enforce a singleton lifecycle for each provider implementation.
   */
  private static instances: Map<string, IDeviceProvider> = new Map()

  /**
   * Returns a configured {@link IDeviceProvider} for the current environment.
   *
   * @returns An implementation of {@link IDeviceProvider}:
   * - {@link BrowserStackProvider} if `provider=browserstack`
   * - {@link SauceLabsProvider} if `provider=saucelabs` or `provider=sauce`
   * - {@link LocalProvider} for `provider=local` or if not specified
   *
   * @remarks
   * - The provider name is resolved from the `provider` field in the
   *   environment configuration (see {@link ConfigManager}).
   * - Provider names are case-insensitive.
   * - If no `provider` is configured, defaults to `local`.
   * - Reuses cached instances to avoid repeated initialisation.
   *
   * @example
   * ```ts
   * const provider = ProviderFactory.getProvider()
   * const session = await provider.getMobileDriver({ platformName: "Android" })
   * ```
   */
  public static getProvider(): IDeviceProvider {
    const config = ConfigManager.getInstance().getAll()
    const providerName = (config.provider || "local").toLowerCase()

    if (ProviderFactory.instances.has(providerName)) {
      return ProviderFactory.instances.get(providerName)!
    }

    let provider: IDeviceProvider
    switch (providerName) {
      case "browserstack":
        provider = new BrowserStackProvider()
        break
      case "saucelabs":
      case "sauce":
        provider = new SauceLabsProvider()
        break
      case "local":
      default:
        provider = new LocalProvider()
        break
    }
    ProviderFactory.instances.set(providerName, provider)
    return provider
  }
}
