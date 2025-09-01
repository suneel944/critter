import DeviceBroker from '../../src/framework/DeviceBroker';
import Logger from '../../src/framework/shared/logger';

/*
 * Example device registration script.  In a real implementation this script
 * could connect to your provider (e.g. local farm, BrowserStack, Sauce Labs)
 * and register a device for use in tests.  At present it simply demonstrates
 * how to obtain the broker and acquire a driver.
 */

async function main() {
  const broker = new DeviceBroker();
  await broker.init();
  const driver = await broker.getMobileDriver();
  Logger.info('Acquired a mobile session for registration.');
  // Perform any provider‑specific registration logic here
  await broker.releaseDriver(driver);
  await broker.cleanup();
  Logger.info('Device registration completed.');
}

main().catch((err) => {
  Logger.error('Failed to register device', err);
  process.exit(1);
});