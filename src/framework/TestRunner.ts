import DeviceBroker from './DeviceBroker';
import ApiClient from './api/ApiClient';
import ResponseValidator from './api/ResponseValidator';
import Logger from './shared/logger';

/**
 * TestRunner orchestrates execution across the different layers (UI, mobile and
 * API).  Its responsibility is to coordinate driver acquisition, run the
 * appropriate tests and perform final cleanup.  This class does not contain
 * specific test cases; rather it is a harness used by CI scripts or npm
 * commands to trigger suites.
 */
export default class TestRunner {
  private deviceBroker: DeviceBroker;
  private apiClient: ApiClient;

  constructor() {
    this.deviceBroker = new DeviceBroker();
    this.apiClient = new ApiClient();
  }

  /**
   * Example method demonstrating how to run a simple UI test using the
   * framework.  In a real project, the test files would live under
   * `tests/ui/specs` and use Playwright's test runner.  This example shows how
   * you might obtain a driver manually.
   */
  public async runUISmokeTest(): Promise<void> {
    Logger.info('Starting UI smoke test');
    const driver = await this.deviceBroker.getWebDriver();
    try {
      // Example: navigate to base URL and check title
      await driver.url('/');
      const title = await driver.getTitle();
      Logger.info(`Page title: ${title}`);
    } finally {
      await this.deviceBroker.releaseDriver(driver);
    }
  }

  /**
   * Example method demonstrating how to run a simple mobile test.  Tests would
   * normally be defined using WebdriverIO specs.  Here we show manual
   * acquisition and release of a mobile session.
   */
  public async runMobileSmokeTest(): Promise<void> {
    Logger.info('Starting mobile smoke test');
    const driver = await this.deviceBroker.getMobileDriver();
    try {
      // Example: print current activity (Android) or app state
      const currentActivity = await driver.getCurrentActivity?.();
      Logger.info(`Current activity: ${currentActivity}`);
    } finally {
      await this.deviceBroker.releaseDriver(driver);
    }
  }

  /**
   * Example method demonstrating how to run a simple API test using ApiClient
   * and ResponseValidator.  Real API tests live under `tests/api/specs`.
   */
  public async runApiSmokeTest(): Promise<void> {
    Logger.info('Starting API smoke test');
    const response = await this.apiClient.get('/status');
    await ResponseValidator.expectStatus(response, 200);
    const body = await ResponseValidator.json(response);
    Logger.info(`API response: ${JSON.stringify(body)}`);
  }

  /**
   * Clean up resources.  Should be called after all tests finish.
   */
  public async cleanup(): Promise<void> {
    await this.deviceBroker.cleanup();
  }
}