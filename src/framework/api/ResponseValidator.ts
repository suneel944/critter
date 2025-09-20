import type { APIResponse } from "playwright"
import Logger from "../shared/logger"

/**
 * Minimal structural types for Ajv integration.
 *
 * @remarks
 * These types avoid a hard dependency on Ajv at compile time.
 * If Ajv is present at runtime, schema validation is enabled.
 */
type ValidateFn = ((data: unknown) => boolean) & { errors?: unknown }
type AjvInstance = { compile: (schema: unknown) => ValidateFn }
type AjvCtorLike = new () => AjvInstance

/**
 * Utility class for validating Playwright API responses.
 *
 * @remarks
 * - Provides common assertions such as expected status codes.
 * - Supports type-safe JSON parsing with caller-provided generics.
 * - Optionally integrates with Ajv for JSON Schema validation.
 *   - If Ajv is not installed, validation is skipped with a warning.
 */
export default class ResponseValidator {
  /**
   * Assert that the response HTTP status matches the expected value.
   *
   * @param response - The Playwright {@link APIResponse} to check.
   * @param expected - The expected HTTP status code.
   * @throws If the status does not match, includes the response body in the error.
   *
   * @example
   * ```ts
   * const res = await client.get("/users")
   * await ResponseValidator.expectStatus(res, 200)
   * ```
   */
  public static async expectStatus(
    response: APIResponse,
    expected: number,
  ): Promise<void> {
    const actual = response.status()
    if (actual !== expected) {
      const text = await response.text()
      throw new Error(
        `Expected status ${expected}, but got ${actual}. Response body: ${text}`,
      )
    }
  }

  /**
   * Parse the response body as JSON with optional type inference.
   *
   * @typeParam T - Expected JSON shape (defaults to `unknown`).
   * @param response - The Playwright {@link APIResponse} to parse.
   * @returns The parsed JSON body typed as `T`.
   *
   * @example
   * ```ts
   * type User = { id: string; name: string }
   * const res = await client.get("/users/1")
   * const user = await ResponseValidator.json<User>(res)
   * ```
   */
  public static async json<T = unknown>(response: APIResponse): Promise<T> {
    return response.json() as Promise<T>
  }

  /**
   * Validate the response JSON against a provided JSON Schema using Ajv.
   *
   * @param response - The Playwright {@link APIResponse} to validate.
   * @param schema - The JSON Schema to validate against.
   * @throws If validation fails, includes Ajv error details.
   *
   * @remarks
   * - If Ajv is not installed, logs a warning and skips validation.
   * - If Ajv is present but the module shape is not recognized, logs a warning.
   * - Validates the entire response body parsed as JSON.
   *
   * @example
   * ```ts
   * const schema = { type: "object", properties: { id: { type: "string" } }, required: ["id"] }
   * const res = await client.get("/users/1")
   * await ResponseValidator.validateSchema(res, schema)
   * ```
   */
  public static async validateSchema(
    response: APIResponse,
    schema: unknown,
  ): Promise<void> {
    let AjvCtor: AjvCtorLike | undefined

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod: unknown = require("ajv")
      AjvCtor = extractAjvCtor(mod)
    } catch (err) {
      if (isModuleNotFoundError(err)) {
        Logger.warn("AJV not installed skipping schema validation.")
        return
      }
      throw err
    }

    if (!AjvCtor) {
      Logger.warn("AJV module shape not recognized skipping schema validation.")
      return
    }

    const ajv = new AjvCtor()
    const data: unknown = await response.json()
    const validate = ajv.compile(schema)
    const valid = validate(data)

    if (!valid) {
      const details = safeStringify(validate.errors)
      throw new Error(`Schema validation failed: ${details}`)
    }
  }
}

/* ----------------------------- helpers ----------------------------- */

/**
 * Check if a value is a plain object.
 */
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null
}

/**
 * Check if a module export has a `default` property.
 */
function hasDefault(v: unknown): v is { default: unknown } {
  return isObject(v) && "default" in v
}

/**
 * Check if a value looks like a valid Ajv constructor.
 */
function isAjvCtorLike(v: unknown): v is AjvCtorLike {
  if (typeof v !== "function") return false
  try {
    const inst = new (v as new () => { compile?: unknown })()
    return typeof inst.compile === "function"
  } catch {
    return false
  }
}

/**
 * Extract an Ajv constructor from a module (handles both CJS/ESM shapes).
 */
function extractAjvCtor(mod: unknown): AjvCtorLike | undefined {
  if (hasDefault(mod) && isAjvCtorLike(mod.default)) return mod.default
  if (isAjvCtorLike(mod)) return mod
  return undefined
}

/**
 * Detect a `MODULE_NOT_FOUND` error object.
 */
function isModuleNotFoundError(e: unknown): e is { code: string } {
  return isObject(e) && typeof (e as { code?: unknown }).code === "string" && (e as { code: string }).code === "MODULE_NOT_FOUND"
}

/**
 * Safely stringify a value to JSON or fallback to `String()`.
 */
function safeStringify(v: unknown): string {
  try { return JSON.stringify(v) } catch { return String(v) }
}
