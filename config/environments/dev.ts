import type { EnvironmentConfig } from '@critter'

/**
 * Development environment configuration. Cloud creds are optional,
 * so we coalesce to empty strings for strict typing.
 */
const devConfig: EnvironmentConfig = {
  provider: 'local',
  user: process.env.CLOUD_USER ?? '',
  key: process.env.CLOUD_KEY ?? '',
  automationExerciseBaseUrl: 'https://automationexercise.com',
  exampleBaseUrl: 'https://www.example.com',
  reqResBaseUrl: 'https://reqres.in',
  reqResApiKey: process.env.REQ_RES_API_KEY ?? '',
  debug: process.env.DEBUG,
  logLevel: process.env.LOG_LEVEL
}

export default devConfig
