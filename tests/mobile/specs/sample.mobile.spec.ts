// tests/mobile/specs/sample.mobile.spec.ts

import { CapabilityBuilder, type Caps } from '@critter'
import { test, expect } from '@playwright/test'

import { createMobileDriver, releaseMobileDriver } from '../session'

let caps: Caps

test.beforeAll(() => {
  // Example Android mobile-web session targeting Chrome
  caps = CapabilityBuilder.android()
    .browserName('Chrome')
    .udid('10AD7N1862001AS')
    .platformVersion('15.0')
    .build()
})

test('Can launch Chrome on device', { tag: '@android' }, async () => {
  // Use the raw driver for mobile-web URL navigation/title check     // <-- your device ids
  const { driver } = await createMobileDriver(caps)

  try {
    await driver.url('https://example.com')
    const title = await driver.getTitle()
    expect(title.toLowerCase()).toContain('example')
  } finally {
    // Always release the session via the broker-aware helper
    await releaseMobileDriver(driver)
  }
})
