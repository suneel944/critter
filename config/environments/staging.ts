import { EnvironmentConfig } from "../../src/framework/core/ConfigManager"

/**
 * Staging environment configuration.  Values are loaded primarily from
 * environment variables to allow external override while providing
 * reasonable defaults when not set.
 */
const stagingConfig: EnvironmentConfig = {
  provider: process.env.STAGING_PROVIDER || "browserstack",
  user: process.env.STAGING_CLOUD_USER,
  key: process.env.STAGING_CLOUD_KEY,
  automationExerciseBaseUrl: "https://automationexercise.com",
  exampleBaseUrl: "https://www.example.com",
  reqResBaseUrl: "https://reqres.in",
  reqResApiKey: process.env.REQ_RES_API_KEY
}

export default stagingConfig
