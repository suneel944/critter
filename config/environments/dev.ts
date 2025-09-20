import { EnvironmentConfig } from "../../src/framework/core/ConfigManager";

/**
 * Development environment configuration.  Defines base URLs and provider
 * defaults for local testing.  Credentials for cloud providers can be
 * supplied via environment variables and are optional in dev.
 */
const devConfig: EnvironmentConfig = {
  provider: "local",
  user: process.env.CLOUD_USER,
  key: process.env.CLOUD_KEY,
  automationExerciseBaseUrl: "https://automationexercise.com",
  exampleBaseUrl: "https://www.example.com",
  reqResBaseUrl: "https://reqres.in",
  reqResApiKey: process.env.REQ_RES_API_KEY,
};

export default devConfig;
