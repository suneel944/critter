import type { EnvironmentConfig } from '@critter'

/**
 * Production environment configuration. Values are sourced from env
 * with explicit string fallbacks to satisfy strict typing.
 */
const prodConfig: EnvironmentConfig = {
  provider: process.env.PROD_PROVIDER ?? 'saucelabs',
  user: process.env.PROD_CLOUD_USER ?? '',
  key: process.env.PROD_CLOUD_KEY ?? '',
  automationExerciseBaseUrl: 'https://automationexercise.com',
  exampleBaseUrl: 'https://www.example.com',
  reqResBaseUrl: 'https://reqres.in',
  reqResApiKey: process.env.REQ_RES_API_KEY ?? '',
  debug: process.env.DEBUG,
  logLevel: process.env.LOG_LEVEL
}

export default prodConfig
