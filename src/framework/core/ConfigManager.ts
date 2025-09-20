import { resolve } from "path"
import { existsSync, readFileSync } from "fs"
import dotenv from "dotenv"

/**
 * Base configuration keys that are known and strongly typed.
 *
 * @remarks
 * Extend this interface if you want to add more strongly typed keys.
 */
export interface BaseConfig {
  /** Name of the device provider (`local`, `browserstack`, `saucelabs`, …). */
  provider?: string
  /** Username or access key for the provider (if required). */
  user?: string
  /** Secret key or password for the provider (if required). */
  key?: string
}

/**
 * Full environment configuration object.
 *
 * @remarks
 * Combines {@link BaseConfig} with arbitrary extra keys (typed as `unknown`)
 * to allow flexible extension without breaking type safety.
 */
export type EnvironmentConfig = BaseConfig & Record<string, unknown>

/* ---------- tiny type guards ---------- */

/**
 * Type guard for plain objects (non-null, non-array).
 */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

/**
 * Type guard for CommonJS/ESM modules with a `default` export.
 */
function hasDefault(v: unknown): v is { default: unknown } {
  return isRecord(v) && "default" in v
}

/**
 * Centralized configuration manager.
 *
 * @remarks
 * - Implements the **Singleton pattern** to ensure a single config instance.
 * - Loads environment configuration from multiple sources, in order:
 *   1. `config/environments/{env}.{ts|js|cjs|json}`
 *   2. `dist/config/environments/{env}.{js|cjs}`
 * - Supports `.ts` configs during development by registering `ts-node`.
 * - Reads the active environment from `TEST_ENVIRONMENT` or `APP_ENV`
 *   environment variables (default: `dev`).
 *
 * ConfigManager is the **single source of truth** for provider selection
 * and environment-specific values across the framework.
 */
export default class ConfigManager {
  private static instance: ConfigManager
  private readonly config: EnvironmentConfig
  /** Name of the active environment (e.g. `dev`, `staging`, `prod`). */
  public readonly env: string

  /**
   * Constructs and loads the configuration for the active environment.
   *
   * @internal
   * Use {@link ConfigManager.getInstance} instead of calling this directly.
   */
  private constructor() {
    dotenv.config()
    this.env = process.env.TEST_ENVIRONMENT || process.env.APP_ENV || "dev"

    const root = process.env.CONFIG_ROOT
      ? resolve(process.cwd(), process.env.CONFIG_ROOT)
      : resolve(process.cwd(), "config", "environments")

    // Candidate config files in priority order
    const tsPath = resolve(root, `${this.env}.ts`)
    const jsPath = resolve(root, `${this.env}.js`)
    const cjsPath = resolve(root, `${this.env}.cjs`)
    const jsonPath = resolve(root, `${this.env}.json`)
    const distJs = resolve(
      process.cwd(),
      "dist",
      "config",
      "environments",
      `${this.env}.js`,
    )
    const distCjs = resolve(
      process.cwd(),
      "dist",
      "config",
      "environments",
      `${this.env}.cjs`,
    )

    const cfg = this.loadConfigFromFirstExisting([
      tsPath,
      jsPath,
      cjsPath,
      jsonPath,
      distJs,
      distCjs,
    ])
    this.config = cfg
  }

  /**
   * Accessor for the singleton instance of `ConfigManager`.
   *
   * @returns The single `ConfigManager` instance, initialised on first call.
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  /**
   * Get a known config key (strongly typed).
   *
   * @param key - The config key to retrieve.
   * @returns The value of the requested key, typed according to {@link BaseConfig}.
   */
  public get<K extends keyof BaseConfig>(key: K): BaseConfig[K]
  /**
   * Get any config key (including custom extras).
   *
   * @param key - Arbitrary string key.
   * @returns The value as `unknown`.
   */
  public get(key: string): unknown
  public get(key: string): unknown {
    return this.config[key]
  }

  /**
   * Returns a shallow copy of the entire environment configuration.
   *
   * @returns All config key–value pairs, including known and custom keys.
   */
  public getAll(): EnvironmentConfig {
    return { ...this.config }
  }

  // ---------- internal helpers ----------

  /**
   * Load configuration from the first existing file in a list of paths.
   *
   * @param paths - Candidate file paths in priority order.
   * @returns Parsed and validated configuration.
   * @throws If no config file exists or if parsing fails.
   */
  private loadConfigFromFirstExisting(paths: string[]): EnvironmentConfig {
    for (const p of paths) {
      if (!existsSync(p)) continue

      const lower = p.toLowerCase()
      if (lower.endsWith(".json")) {
        const raw = readFileSync(p, "utf-8")
        let parsed: unknown
        try {
          parsed = JSON.parse(raw)
        } catch (e) {
          throw new Error(`Invalid JSON in ${p}: ${(e as Error).message}`)
        }
        return this.validate(parsed, p)
      }

      if (lower.endsWith(".ts")) {
        // Register ts-node on the fly for TS configs in dev.
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require("ts-node/register/transpile-only")
        } catch {
          // If ts-node isn't available, user should run via ts-node/tsx or build first.
        }
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require(p) as unknown
        const exp = hasDefault(mod) ? mod.default : mod
        return this.validate(exp, p)
      }

      if (lower.endsWith(".js") || lower.endsWith(".cjs")) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require(p) as unknown
        const exp = hasDefault(mod) ? mod.default : mod
        return this.validate(exp, p)
      }
    }

    throw new Error(
      `Environment config not found for '${this.env}'. Looked for: ${paths.map((s) => `- ${s}`).join("\n")}`,
    )
  }

  /**
   * Validate that a candidate config is a plain object.
   *
   * @param candidate - The parsed config export.
   * @param sourcePath - Path of the file the config came from.
   * @returns The candidate, typed as {@link EnvironmentConfig}.
   * @throws If the candidate is not a plain object.
   */
  private validate(candidate: unknown, sourcePath: string): EnvironmentConfig {
    if (!isRecord(candidate)) {
      throw new Error(
        `Invalid config object in ${sourcePath}: expected a plain object`,
      )
    }
    return candidate as EnvironmentConfig
  }
}
