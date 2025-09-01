import { remote } from 'webdriverio';
import { DeviceProvider } from './DeviceProvider';
import ConfigManager from '../ConfigManager';
import Logger from '../shared/logger';

/**
 * SauceLabsProvider connects to Sauce Labs cloud.  It reads credentials and
 * region from configuration.  Sauce Labs requires a username and access key
 * which are passed via the `user` and `key` options.
 */
export class SauceLabsProvider implements DeviceProvider {
  public readonly name = 'saucelabs';

  private user: string;
  private key: string;
  private region: string;
  private sauceConnect: boolean;

  constructor() {
    const config = ConfigManager.getInstance().getAll();
    this.user = config.user || process.env.SAUCE_USERNAME || '';
    this.key = config.key || process.env.SAUCE_ACCESS_KEY || '';
    this.region = process.env.SAUCE_REGION || 'us-west-1';
    this.sauceConnect = process.env.SAUCE_CONNECT === 'true';
  }

  async init(): Promise<void> {
    // If you need to start SauceConnect, do it here.  The WebdriverIO Sauce
    // service can handle this automatically if configured via wdio.
    Logger.debug('Initialising SauceLabsProvider');
    return;
  }

  async getWebDriver(capabilities: Record<string, any> = {}): Promise<any> {
    Logger.info('Acquiring Sauce Labs web session');
    const options: any = {
      protocol: 'https',
      hostname: `${this.region}.saucelabs.com`,
      port: 443,
      path: '/wd/hub',
      user: this.user,
      key: this.key,
      capabilities: {
        browserName: capabilities.browserName || 'chrome',
        browserVersion: capabilities.browserVersion || 'latest',
        platformName: capabilities.platformName || 'Windows 10',
        'sauce:options': {
          build: capabilities.build || 'critter-build',
          name: capabilities.name || 'UI Test',
          tunnelIdentifier: this.sauceConnect ? process.env.SAUCE_TUNNEL_IDENTIFIER : undefined,
          ...capabilities['sauce:options'],
        },
        ...capabilities,
      },
    };
    const driver = await remote(options);
    return driver;
  }

  async getMobileDriver(capabilities: Record<string, any> = {}): Promise<any> {
    Logger.info('Acquiring Sauce Labs mobile session');
    const options: any = {
      protocol: 'https',
      hostname: `${this.region}.saucelabs.com`,
      port: 443,
      path: '/wd/hub',
      user: this.user,
      key: this.key,
      capabilities: {
        platformName: capabilities.platformName || 'Android',
        'appium:deviceName': capabilities.deviceName,
        'appium:platformVersion': capabilities.platformVersion,
        'appium:app': capabilities.app, // Sauce storage ID or remote URL
        'appium:automationName': capabilities.automationName || 'UiAutomator2',
        'sauce:options': {
          build: capabilities.build || 'critter-build',
          name: capabilities.name || 'Mobile Test',
          tunnelIdentifier: this.sauceConnect ? process.env.SAUCE_TUNNEL_IDENTIFIER : undefined,
          ...capabilities['sauce:options'],
        },
        ...capabilities,
      },
    };
    const driver = await remote(options);
    return driver;
  }

  async releaseDriver(driver: any): Promise<void> {
    if (driver && typeof driver.deleteSession === 'function') {
      Logger.debug('Releasing Sauce Labs session');
      await driver.deleteSession();
    }
  }

  async cleanup(): Promise<void> {
    // When using Sauce Connect you may need to shut down the tunnel.  Skip here.
    Logger.debug('Cleaning up SauceLabsProvider');
    return;
  }
}