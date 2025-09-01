import { resolve } from 'path';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

/**
 * Interface representing the structure of environment‑specific configuration.
 * Extend this interface with additional keys as your application grows.
 */
export interface EnvironmentConfig {
  /** Base URL of the application under test. */
  baseUrl: string;
  /** Base URL for API calls. */
  apiUrl: string;
  /** Default browser/device provider (e.g. 'local', 'browserstack', 'saucelabs'). */
  provider?: string;
  /** Optional user identifier for cloud providers such as BrowserStack/Sauce Labs. */
  user?: string;
  /** Optional access key for cloud providers. */
  key?: string;
  /** Additional key/value pairs for custom config settings. */
  [key: string]: any;
}

/**
 * ConfigManager centralizes configuration loading for the entire automation framework.
 * It reads environment variables from a `.env` file (if present) and loads
 * environment‑specific settings from the `config/environments/` directory at
 * the project root.  Use the `getInstance()` method to obtain a singleton instance.  This pattern
 * prevents redundant file reads and ensures type safety across the codebase.
 */
export default class ConfigManager {
  private static instance: ConfigManager;
  private readonly config: EnvironmentConfig;
  /** The active environment (e.g. 'dev', 'staging', 'prod'). */
  public readonly env: string;

  private constructor() {
    // Load variables from .env into process.env.  If the file does not exist,
    // dotenv silently does nothing.  This call should occur before reading
    // environment‑specific configs so that variables like TEST_ENVIRONMENT are set.
    dotenv.config();

    // Determine which environment we are running in.  Default to 'dev'.
    this.env = process.env.TEST_ENVIRONMENT || process.env.APP_ENV || 'dev';

    // Resolve the path to the environment module relative to the project root.
    // Environment files live under the `config/environments/` directory at
    // the repository root rather than inside the compiled src.  Using
    // process.cwd() ensures compatibility when running compiled code from
    // the dist folder.
    const envPath = resolve(process.cwd(), 'config', 'environments', `${this.env}.ts`);

    if (!existsSync(envPath)) {
      throw new Error(
        `Environment configuration file not found for environment '${this.env}'. Expected at ${envPath}.`
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const moduleExport = require(envPath);
    const envConfig: EnvironmentConfig = moduleExport.default || moduleExport;

    this.config = envConfig;
  }

  /**
   * Retrieve the singleton instance of ConfigManager.  Always call this method
   * rather than the constructor to ensure that configuration is loaded once.
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Get a configuration value by key.  Returns `undefined` if the key is not
   * defined.  Use explicit typing or default values at call sites to handle
   * undefined results gracefully.
   *
   * @param key The configuration property name to retrieve.
   */
  public get<T extends keyof EnvironmentConfig>(key: T): EnvironmentConfig[T] {
    return this.config[key];
  }

  /**
   * Return a shallow copy of the entire environment configuration.  This can be
   * useful for destructuring multiple values at once without repeated calls to
   * `get()`.  Modifying the returned object does not affect the internal state.
   */
  public getAll(): EnvironmentConfig {
    return { ...this.config };
  }
}