/**
 * Configuration helper for Sauce Labs.  Reads values from environment variables.
 */
export default {
  user: process.env.SAUCE_USERNAME || process.env.SAUCE_USER,
  key: process.env.SAUCE_ACCESS_KEY || process.env.SAUCE_KEY,
  region: process.env.SAUCE_REGION || 'us-west-1',
  connect: process.env.SAUCE_CONNECT === 'true',
  tunnelIdentifier: process.env.SAUCE_TUNNEL_IDENTIFIER
};