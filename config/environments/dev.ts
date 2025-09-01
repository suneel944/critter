import { EnvironmentConfig } from '../../src/framework/ConfigManager';

/**
 * Development environment configuration.  Defines base URLs and provider
 * defaults for local testing.  Credentials for cloud providers can be
 * supplied via environment variables and are optional in dev.
 */
const devConfig: EnvironmentConfig = {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3001',
  provider: 'local',
  user: process.env.CLOUD_USER,
  key: process.env.CLOUD_KEY,
  automationExercise: 'https://automationexercise.com'
};

export default devConfig;