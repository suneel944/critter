import { DeviceBroker, type IAdapter, type ProviderOptions } from '@critter'

import type { Browser } from 'webdriverio'

/** Preferred flow: get a bound Appium adapter via the broker. */
export async function createMobileAdapter(options: ProviderOptions): Promise<IAdapter> {
  const broker = new DeviceBroker()
  return broker.getMobileAdapter(options)
}

/** Legacy/low-level: get a raw driver; you manage it. */
export async function createMobileDriver(options: ProviderOptions) {
  const broker = new DeviceBroker()
  return broker.getMobileDriver(options)
}

/** Cleanup helper if you used the raw driver. */
export async function releaseMobileDriver(driver: Browser): Promise<void> {
  const broker = new DeviceBroker()
  await broker.releaseDriver(driver)
  await broker.cleanup()
}
