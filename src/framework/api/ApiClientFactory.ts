import type { APIResponse } from "playwright"
import ApiClient from "./clients/ApiClient"
import type { BuiltRequest } from "./builders/RequestBuilder"

/**
 * Initialization contract for creating an {@link ApiClient}.
 */
export interface ClientInit {
  /** Base URL applied to all requests issued by this client. */
  baseURL: string
  /** Default headers applied to every request unless overridden. */
  defaultHeaders: Record<string, string>
}

/**
 * Exhaustiveness helper for unreachable code in switch statements.
 *
 * @param x - Value that should be of type `never`.
 * @throws Always throws with a helpful error message.
 *
 * @remarks
 * This enforces compile-time checks that all union members
 * (HTTP methods in this case) are covered.
 */
function assertUnreachable(x: never): never {
  throw new Error(`ApiClientFactory.send: unsupported HTTP method ${String(x)}`)
}

/**
 * Factory for constructing {@link ApiClient} instances and executing
 * {@link BuiltRequest} objects.
 *
 * @remarks
 * - Encapsulates creation of `ApiClient` with required headers and base URL.
 * - Provides a single entry point to dispatch a `BuiltRequest` via the
 *   correct HTTP verb.
 * - Uses exhaustive switch to ensure all supported HTTP methods are handled.
 */
export default class ApiClientFactory {
  /**
   * Create a new {@link ApiClient}.
   *
   * @param init - Configuration containing base URL and default headers.
   * @returns A ready-to-use {@link ApiClient}.
   *
   * @example
   * ```ts
   * const client = ApiClientFactory.create({
   *   baseURL: "https://api.example.com",
   *   defaultHeaders: { Authorization: "Bearer token" }
   * })
   * ```
   */
  static create(init: ClientInit): ApiClient {
    return new ApiClient({ baseURL: init.baseURL, defaultHeaders: init.defaultHeaders })
  }

  /**
   * Execute a {@link BuiltRequest} using the given {@link ApiClient}.
   *
   * @param client - The API client to use for sending the request.
   * @param req - The request to execute, including HTTP method, path, and options.
   * @returns A Playwright {@link APIResponse}.
   *
   * @remarks
   * - Dispatches based on the `method` field of the request.
   * - Covers all standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, `OPTIONS`).
   * - Falls back to {@link assertUnreachable} if an unsupported method is encountered.
   *
   * @example
   * ```ts
   * const request: BuiltRequest = {
   *   method: "POST",
   *   path: "/users",
   *   options: { data: { name: "Alice" } }
   * }
   * const response = await ApiClientFactory.send(client, request)
   * expect(response.status()).toBe(201)
   * ```
   */
  static async send(client: ApiClient, req: BuiltRequest): Promise<APIResponse> {
    const { method, path, options } = req

    switch (method) {
      case "GET":     return client.get(path,     options)
      case "POST":    return client.post(path,    options)
      case "PUT":     return client.put(path,     options)
      case "DELETE":  return client.delete(path,  options)
      case "PATCH":   return client.patch(path,   options)
      case "HEAD":    return client.head(path,    options)
      case "OPTIONS": return client.options(path, options)
      default:        return assertUnreachable(method)
    }
  }
}
