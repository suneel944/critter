import ConfigManager from '../config/ConfigManager'
import { BrowserStackProvider } from '../providers/BrowserStackProvider'
import { LocalProvider } from '../providers/LocalProvider'
import { SauceLabsProvider } from '../providers/SauceLabsProvider'
import type { IDeviceProvider } from '../shared/ports/IDeviceProvider'

/**
 * Provider selection and lifecycle manager.
 *
 * @summary
 * Returns a configured {@link IDeviceProvider} based on environment config and
 * guarantees a single instance (per provider kind) within the current process.
 *
 * @remarks
 * - **Selection** is driven by `provider` in {@link ConfigManager}’s resolved config.
 *   Supported values (case-insensitive):
 *   - `"browserstack"` → {@link BrowserStackProvider}
 *   - `"saucelabs"` or `"sauce"` → {@link SauceLabsProvider}
 *   - `"local"` (default) → {@link LocalProvider}
 * - **Lifecycle**: Instances are cached, so repeated calls return the same object
 *   (simple in-process singleton per provider kind).
 * - **Scope**: This cache is per Node.js process. It does not persist across workers/containers.
 * - **Why a factory?** Keeps client code decoupled from concrete providers and centralizes the
 *   mapping between config → implementation.
 *
 * @extension
 * To add a new provider:
 * 1. Implement {@link IDeviceProvider} (e.g. `FooCloudProvider`).
 * 2. Teach `getProvider()` a new case label (e.g. `"foocloud"`).
 * 3. Document the expected config keys in your provider class.
 *
 * @example
 * ```ts
 * // config: { provider: "browserstack", ... }
 * const provider = ProviderFactory.getProvider()
 * const session = await provider.getMobileDriver({ platformName: 'Android' })
 * // use session.driver for actions, then provider.cleanup(session)
 * ```
 */
export default class ProviderFactory {
  /**
   * In-process cache of provider singletons keyed by normalized provider name.
   *
   * @internal
   * Ensures we don’t construct duplicate provider instances with duplicated connections.
   */
  private static instances: Map<string, IDeviceProvider> = new Map()

  /**
   * Resolve and return the active {@link IDeviceProvider}.
   *
   * @returns The selected provider instance (singleton per kind).
   *
   * @remarks
   * - Reads `provider` from {@link ConfigManager.getAll | ConfigManager.getAll()}.
   * - Falls back to `"local"` when unset or unrecognized (default branch).
   * - Normalizes the value to lowercase before matching.
   * - Reuses a cached instance when available; otherwise constructs, caches, and returns it.
   *
   * @example Default (no `provider` set)
   * ```ts
   * // config has no 'provider' -> LocalProvider
   * const p = ProviderFactory.getProvider()
   * ```
   *
   * @example Sauce Labs (aliases supported)
   * ```ts
   * // config: { provider: "Sauce" } or { provider: "saucelabs" }
   * const p = ProviderFactory.getProvider() // SauceLabsProvider
   * ```
   */
  public static getProvider(): IDeviceProvider {
    const config = ConfigManager.getInstance().getAll()
    const providerName = (config.provider || 'local').toLowerCase()

    if (ProviderFactory.instances.has(providerName)) {
      return ProviderFactory.instances.get(providerName)!
    }

    let provider: IDeviceProvider
    switch (providerName) {
      case 'browserstack':
        provider = new BrowserStackProvider()
        break
      case 'saucelabs':
      case 'sauce':
        provider = new SauceLabsProvider()
        break
      case 'local':
      default:
        provider = new LocalProvider()
        break
    }
    ProviderFactory.instances.set(providerName, provider)
    return provider
  }
}
