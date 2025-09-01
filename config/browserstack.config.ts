/**
 * Configuration helper for BrowserStack.  Values are read from environment
 * variables defined in .env.  Use this module to centralise BrowserStack
 * settings used by wdio and other services.
 */
export default {
  user: process.env.BROWSERSTACK_USER,
  key: process.env.BROWSERSTACK_KEY,
  local: process.env.BROWSERSTACK_LOCAL === 'true',
  region: process.env.BROWSERSTACK_REGION || 'us'
};