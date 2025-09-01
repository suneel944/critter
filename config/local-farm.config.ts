/**
 * Configuration helper for local device farm (Selenium Grid + Appium).  Values
 * are read from environment variables.  Adjust defaults for your environment.
 */
export default {
  webdriver: {
    host: process.env.LOCAL_WEBDRIVER_HOST || 'localhost',
    port: parseInt(process.env.LOCAL_WEBDRIVER_PORT || '4444'),
    path: process.env.LOCAL_WEBDRIVER_PATH || '/wd/hub'
  },
  appium: {
    host: process.env.LOCAL_APPIUM_HOST || 'localhost',
    port: parseInt(process.env.LOCAL_APPIUM_PORT || '4723'),
    path: process.env.LOCAL_APPIUM_PATH || '/wd/hub'
  }
};