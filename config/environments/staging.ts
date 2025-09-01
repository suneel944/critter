import { EnvironmentConfig } from '../../src/framework/ConfigManager';

/**
 * Staging environment configuration.  Values are loaded primarily from
 * environment variables to allow external override while providing
 * reasonable defaults when not set.
 */
const stagingConfig: EnvironmentConfig = {
  baseUrl: process.env.STAGING_BASE_URL || 'https://staging.example.com',
  apiUrl: process.env.STAGING_API_URL || 'https://api.staging.example.com',
  provider: process.env.STAGING_PROVIDER || 'browserstack',
  user: process.env.STAGING_CLOUD_USER,
  key: process.env.STAGING_CLOUD_KEY,
  automationExerciseBaseUrl: 'https://automationexercise.com',
  exampleBaseUrl: 'https://www.example.com'
};

export default stagingConfig;