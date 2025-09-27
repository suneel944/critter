import type { EnvironmentConfig } from '@critter'

/**
 * Staging environment configuration. Values are read from env with
 * safe fallbacks to satisfy strict typing.
 */
const stagingConfig: EnvironmentConfig = {
  provider: process.env.STAGING_PROVIDER ?? 'browserstack',
  user: process.env.STAGING_CLOUD_USER ?? '',
  key: process.env.STAGING_CLOUD_KEY ?? '',
  automationExerciseBaseUrl: 'https://automationexercise.com',
  exampleBaseUrl: 'https://www.example.com',
  reqResBaseUrl: 'https://reqres.in',
  reqResApiKey: process.env.REQ_RES_API_KEY ?? '',
  debug: process.env.DEBUG,
  logLevel: process.env.LOG_LEVEL
}

export default stagingConfig
