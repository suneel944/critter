import {
  AdapterFactory,
  ApiClient,
  ApiClientFactory,
  type BuiltRequest,
  type IAdapter,
  type PlaywrightAdapter,
} from '@critter'
import { test as base, type Page, expect } from '@playwright/test'


type Session = {
  web: (opts?: Record<string, unknown>) => Promise<IAdapter>
  api: (init: { baseURL: string; defaultHeaders?: Record<string, string> }) => ApiClient
  apiSend: (
    clientOrConfig: ApiClient | { baseURL: string; defaultHeaders?: Record<string, string> },
    request: BuiltRequest,
  ) => ReturnType<typeof ApiClientFactory.send>
  pages: <T>(root: new (page: Page) => T, opts?: Record<string, unknown>) => Promise<T>
  cleanup: () => Promise<void>
}

type FX = { session: Session }

export const test = base.extend<FX>({
  session: async ({}, use) => {
    const resources: Array<() => Promise<void>> = []

    const session: Session = {
      api: ({ baseURL, defaultHeaders = {} }) => {
        const client = new ApiClient({ baseURL, defaultHeaders })
        resources.push(async () => client.dispose())
        return client
      },

      apiSend: async (clientOrConfig, request) => {
        const client =
          clientOrConfig instanceof ApiClient ? clientOrConfig : session.api(clientOrConfig)
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
        const pw = adapter as unknown as PlaywrightAdapter
        const page = pw.getPage()
        return new root(page)
      },

      cleanup: async () => {
        while (resources.length) {
          const fn = resources.pop()!
          try {
            await fn()
          } catch {
            /* ignore */
          }
        }
      },
    }

    try {
      await use(session)
    } finally {
      await session.cleanup()
    }
  },
})

export { expect }
