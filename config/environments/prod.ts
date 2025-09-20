import { EnvironmentConfig } from "../../src/framework/core/ConfigManager"

/**
 * Production environment configuration.  Base URLs and provider
 * information are expected to be supplied via environment variables.  Defaults
 * here serve only as fallbacks.
 */
const prodConfig: EnvironmentConfig = {
  provider: process.env.PROD_PROVIDER || "saucelabs",
  user: process.env.PROD_CLOUD_USER,
  key: process.env.PROD_CLOUD_KEY,
  automationExerciseBaseUrl: "https://automationexercise.com",
  exampleBaseUrl: "https://www.example.com",
  reqResBaseUrl: "https://reqres.in",
  reqResApiKey: process.env.REQ_RES_API_KEY
}

export default prodConfig
