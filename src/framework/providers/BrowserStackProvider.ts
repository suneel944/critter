import { remote } from 'webdriverio';
import { DeviceProvider } from './DeviceProvider';
import ConfigManager from '../ConfigManager';
import Logger from '../shared/logger';

/**
 * BrowserStackProvider connects to BrowserStack using WebdriverIO.  It reads
 * credentials and optional settings from the environment configuration.  The
 * BrowserStack service requires a `user` and `key` to authenticate and
 * optionally supports running tests through a local tunnel using
 * `browserstackLocal`.
 */
export class BrowserStackProvider implements DeviceProvider {
  public readonly name = 'browserstack';

  private user: string;
  private key: string;
  private region?: string;
  private browserstackLocal?: boolean;

  constructor() {
    const config = ConfigManager.getInstance().getAll();
    this.user = config.user || process.env.BROWSERSTACK_USER || '';
    this.key = config.key || process.env.BROWSERSTACK_KEY || '';
    this.region = process.env.BROWSERSTACK_REGION;
    this.browserstackLocal = process.env.BROWSERSTACK_LOCAL === 'true';
  }

  async init(): Promise<void> {
    // When running with BrowserStackLocal you might start a local binary here.
    // For simplicity we assume BrowserStack handles this via the wdio service.
    Logger.debug('Initialising BrowserStackProvider');
    return;
  }

  async getWebDriver(capabilities: Record<string, any> = {}): Promise<any> {
    Logger.info('Acquiring BrowserStack web session');
    const options: any = {
      protocol: 'https',
      hostname: this.region ? `${this.region}.browserstack.com` : 'hub.browserstack.com',
      port: 443,
      path: '/wd/hub',
      user: this.user,
      key: this.key,
      capabilities: {
        'bstack:options': {
          os: capabilities.os || 'Windows',
          osVersion: capabilities.osVersion || '10',
          local: this.browserstackLocal,
          buildName: capabilities.buildName || 'critter-build',
          sessionName: capabilities.sessionName || 'UI Test',
          ...capabilities['bstack:options'],
        },
        browserName: capabilities.browserName || 'chrome',
        browserVersion: capabilities.browserVersion || 'latest',
        ...capabilities,
      },
    };
    const driver = await remote(options);
    return driver;
  }

  async getMobileDriver(capabilities: Record<string, any> = {}): Promise<any> {
    // BrowserStack mobile sessions are similar to web sessions but require
    // device capabilities.  We still use WebdriverIO remote() with the
    // appropriate capabilities.
    Logger.info('Acquiring BrowserStack mobile session');
    const options: any = {
      protocol: 'https',
      hostname: this.region ? `${this.region}.browserstack.com` : 'hub.browserstack.com',
      port: 443,
      path: '/wd/hub',
      user: this.user,
      key: this.key,
      capabilities: {
        'bstack:options': {
          deviceName: capabilities.deviceName,
          osVersion: capabilities.osVersion,
          realMobile: capabilities.realMobile ?? true,
          local: this.browserstackLocal,
          buildName: capabilities.buildName || 'critter-build',
          sessionName: capabilities.sessionName || 'Mobile Test',
          appiumVersion: capabilities.appiumVersion || '2.0.0',
          ...capabilities['bstack:options'],
        },
        platformName: capabilities.platformName || 'Android',
        // When testing native apps, supply the BrowserStack uploaded app ID as
        // `app`.  For web testing, leave `browserName` instead of `app`.
        ...capabilities,
      },
    };
    const driver = await remote(options);
    return driver;
  }

  async releaseDriver(driver: any): Promise<void> {
    if (driver && typeof driver.deleteSession === 'function') {
      Logger.debug('Releasing BrowserStack session');
      await driver.deleteSession();
    }
  }

  async cleanup(): Promise<void> {
    // BrowserStack does not require explicit cleanup when using the cloud service.
    Logger.debug('Cleaning up BrowserStackProvider');
    return;
  }
}