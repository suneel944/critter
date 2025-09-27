import { ConfigManager } from '@critter'

import { test, expect } from '../../fixtures/session'

let config: ConfigManager

test.beforeAll(() => {
  config = ConfigManager.getInstance()
})

test('sample home page loads', { tag: ['@unit-ui'] }, async ({ session }) => {
  const adapter = await session.web()
  await adapter.navigate(String(config.get('exampleBaseUrl')))
  const title = String(await adapter.execute('title'))
  expect(title).toMatch(/Example/)
})
