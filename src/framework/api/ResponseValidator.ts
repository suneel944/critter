import { APIResponse } from '@playwright/test';
import Logger from '../shared/logger';

/**
 * ResponseValidator provides convenience functions for asserting API responses.
 *
 * The definitive guide to API testing with Playwright stresses the importance
 * of writing independent tests that clearly state expectations on the API
 * responses.  These helpers encapsulate common checks
 * such as verifying status codes and parsing JSON bodies so that test
 * assertions remain concise.
 */
export default class ResponseValidator {
  /**
   * Asserts that the response status matches the expected status code.
   * Throws an error if the expectation is not met.
   */
  public static async expectStatus(response: APIResponse, expected: number): Promise<void> {
    const actual = response.status();
    if (actual !== expected) {
      const text = await response.text();
      throw new Error(`Expected status ${expected}, but got ${actual}. Response body: ${text}`);
    }
  }

  /**
   * Parses the response body as JSON.
   */
  public static async json<T = any>(response: APIResponse): Promise<T> {
    return response.json() as Promise<T>;
  }

  /**
   * Validates the JSON body against a provided JSON schema.  This method
   * requires the optional `ajv` package to be installed.  If `ajv` is not
   * available the validation will be skipped.
   */
  public static async validateSchema(response: APIResponse, schema: any): Promise<void> {
    try {
      // Dynamically import ajv to avoid hard dependency
      const Ajv = require('ajv');
      const ajv = new Ajv();
      const data = await response.json();
      const validate = ajv.compile(schema);
      const valid = validate(data);
      if (!valid) {
        throw new Error(`Schema validation failed: ${JSON.stringify(validate.errors)}`);
      }
    } catch (err: any) {
      if (err.code === 'MODULE_NOT_FOUND') {
        // Skip schema validation if ajv is not installed
        Logger.warn('AJV not installed; skipping schema validation.');
      } else {
        throw err;
      }
    }
  }
}