import { EnvironmentConfig } from '../../src/framework/ConfigManager';

/**
 * Production environment configuration.  Base URLs and provider
 * information are expected to be supplied via environment variables.  Defaults
 * here serve only as fallbacks.
 */
const prodConfig: EnvironmentConfig = {
  baseUrl: process.env.PROD_BASE_URL || 'https://www.example.com',
  apiUrl: process.env.PROD_API_URL || 'https://api.example.com',
  provider: process.env.PROD_PROVIDER || 'saucelabs',
  user: process.env.PROD_CLOUD_USER,
  key: process.env.PROD_CLOUD_KEY,
  automationExercise: 'https://automationexercise.com'
};

export default prodConfig;