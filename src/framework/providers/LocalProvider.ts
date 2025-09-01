import { remote } from 'webdriverio';
import { DeviceProvider } from './DeviceProvider';
import ConfigManager from '../ConfigManager';
import Logger from '../shared/logger';

/**
 * LocalProvider uses a locally hosted Selenium Grid and Appium servers to
 * provide browser and mobile sessions.  It reads host/port information from
 * environment variables to remain cloud agnostic.  Selenium Grid Helm charts
 * can be installed into any Kubernetes cluster to enable this local farm.
 */
export class LocalProvider implements DeviceProvider {
  public readonly name = 'local';

  private webdriverHost: string;
  private webdriverPort: number;
  private webdriverPath: string;
  private appiumHost: string;
  private appiumPort: number;
  private appiumPath: string;

  constructor() {
    // Access configuration so the provider instance can adapt based on environment
    ConfigManager.getInstance().getAll();
    // Fallback to sensible defaults if not provided via environment variables
    this.webdriverHost = process.env.LOCAL_WEBDRIVER_HOST || 'localhost';
    this.webdriverPort = parseInt(process.env.LOCAL_WEBDRIVER_PORT || '4444');
    this.webdriverPath = process.env.LOCAL_WEBDRIVER_PATH || '/wd/hub';
    this.appiumHost = process.env.LOCAL_APPIUM_HOST || 'localhost';
    this.appiumPort = parseInt(process.env.LOCAL_APPIUM_PORT || '4723');
    this.appiumPath = process.env.LOCAL_APPIUM_PATH || '/wd/hub';
  }

  async init(): Promise<void> {
    // Nothing to initialise for local provider.  In a real implementation this
    // method could verify the grid and appium servers are reachable.
    Logger.debug('Initialising LocalProvider');
    return;
  }

  async getWebDriver(capabilities: Record<string, any> = {}): Promise<any> {
    Logger.info('Acquiring local WebDriver session');
    const options: any = {
      hostname: this.webdriverHost,
      port: this.webdriverPort,
      path: this.webdriverPath,
      capabilities: {
        browserName: capabilities.browserName || 'chrome',
        ...capabilities,
      },
    };
    const driver = await remote(options);
    return driver;
  }

  async getMobileDriver(capabilities: Record<string, any> = {}): Promise<any> {
    Logger.info('Acquiring local mobile driver session');
    const options: any = {
      hostname: this.appiumHost,
      port: this.appiumPort,
      path: this.appiumPath,
      // Appium expects the capabilities inside the `capabilities` key when
      // connecting through the WebdriverIO `remote()` API
      capabilities: {
        platformName: capabilities.platformName || 'Android',
        automationName: capabilities.automationName || 'UiAutomator2',
        // Additional capabilities like deviceName, app, udid can be passed in
        ...capabilities,
      },
    };
    const driver = await remote(options);
    return driver;
  }

  async releaseDriver(driver: any): Promise<void> {
    if (driver && typeof driver.deleteSession === 'function') {
      Logger.debug('Releasing local driver session');
      await driver.deleteSession();
    }
  }

  async cleanup(): Promise<void> {
    // No global resources to clean up for local provider.  If you spawn
    // processes in init() then terminate them here.
    Logger.debug('Cleaning up LocalProvider');
    return;
  }
}