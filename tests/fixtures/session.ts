  import { test as base } from '@playwright/test'
  import AdapterFactory from '../../src/framework/adapters/AdapterFactory'
  import type { IAdapter } from '../../src/framework/adapters/IAdapter'
  import type { Page } from '@playwright/test'
  import ApiClient from '../../src/framework/api/clients/ApiClient'
  import ApiClientFactory from '../../src/framework/api/ApiClientFactory'
  import type { BuiltRequest } from '../../src/framework/api/builders/RequestBuilder'
  import { LocalProvider } from '../../src/framework/providers/LocalProvider'
  import { BrowserStackProvider } from '../../src/framework/providers/BrowserStackProvider'
  import { SauceLabsProvider } from '../../src/framework/providers/SauceLabsProvider'
  import type {
    IDeviceProvider,
    ProviderOptions,
    MobileSession,
  } from '../../src/framework/providers/IDeviceProvider'
  import type { Caps } from '../../src/framework/capabilities/CapabilityBuilder'
  import { PlaywrightAdapter } from '../../src/framework/adapters/PlaywrightAdapter'

  // ----- Provider selection -----
  type ProviderName = 'local' | 'browserstack' | 'saucelabs'
  function makeProvider(name: ProviderName): IDeviceProvider {
    switch (name) {
      case 'browserstack': return new BrowserStackProvider()
      case 'saucelabs':    return new SauceLabsProvider()
      default:             return new LocalProvider()
    }
  }

  // ----- Session API exposed to tests -----
  type Session = {
    web: (opts?: Record<string, unknown>) => Promise<IAdapter>
    mobile: (caps: Caps, options?: { provider?: ProviderName }) => Promise<IAdapter>
    api: (init: { baseURL: string; defaultHeaders?: Record<string, string> }) => ApiClient
    apiSend: (
      clientOrConfig: ApiClient | { baseURL: string; defaultHeaders?: Record<string, string> },
      request: BuiltRequest
    ) => Promise<import('playwright').APIResponse>
    pages: <T>(root: new (page: Page) => T, opts?: Record<string, unknown>) => Promise<T>
    cleanup: () => Promise<void>
  }

  // ----- Fixture -----
  type FX = { session: Session }

  export const test = base.extend<FX>({
    session: async ({}, use) => {
      const resources: Array<() => Promise<void>> = []
      const providers = new Map<ProviderName, IDeviceProvider>()

      async function getOrInitProvider(name: ProviderName): Promise<IDeviceProvider> {
        let p = providers.get(name)
        if (!p) {
          p = makeProvider(name)
          await p.init()
          providers.set(name, p)
        }
        return p
      }

      const session: Session = {
        api: ({ baseURL, defaultHeaders = {} }) => {
          const client = new ApiClient({ baseURL, defaultHeaders })
          resources.push(async () => client.dispose())
          return client
        },

        apiSend: async (clientOrConfig, request) => {
          const client = clientOrConfig instanceof ApiClient
            ? clientOrConfig
            : session.api(clientOrConfig)
          return ApiClientFactory.send(client, request)
        },

        web: async (opts = {}) => {
          const adapter = AdapterFactory.create('playwright')
          await adapter.init({ ...opts })
          resources.push(async () => adapter.teardown())
          return adapter
        },

        pages: async <T>(root: new (page: Page) => T, opts = {}) => {
          const adapter = await session.web(opts)
        
          // Cast to your known concrete adapter type
          const pwAdapter = adapter as unknown as PlaywrightAdapter
        
          // Access the Page from the concrete adapter
          const playwrightPage = pwAdapter.getPage()
        
          if (!playwrightPage) {
            throw new Error('Playwright Page not available from adapter')
          }
        
          return new root(playwrightPage)
        },

        mobile: async (caps: Caps, options) => {
          const providerName: ProviderName =
            options?.provider || (process.env.DEVICE_PROVIDER as ProviderName) || 'local'

          const provider = await getOrInitProvider(providerName)
          const sessionInfo: MobileSession = await provider.getMobileDriver(
            caps as ProviderOptions
          )

          const adapter = AdapterFactory.create('appium')
          await adapter.bind(sessionInfo)

          resources.push(async () => {
            await adapter.teardown()
            await provider.releaseDriver(sessionInfo.driver)
          })

          return adapter
        },

        cleanup: async () => {
          while (resources.length) {
            const fn = resources.pop()!
            try { await fn() } catch { /* ignore */ }
          }
          for (const p of providers.values()) {
            try { await p.cleanup() } catch { /* ignore */ }
          }
        }
      }

      try {
        await use(session)
      } finally {
        await session.cleanup()
      }
    }
  })

  export { expect } from "playwright/test"
