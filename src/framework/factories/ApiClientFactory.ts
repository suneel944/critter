import type { BuiltRequest } from '../api/builders/RequestBuilder'
import ApiClient from '../api/clients/ApiClient'
import type { APIResponse } from 'playwright'

/**
 * Initialization contract for constructing an {@link ApiClient}.
 *
 * @remarks
 * - `baseURL` is used as the origin for all relative `path` values sent via the client.
 * - `defaultHeaders` are merged into every request; per-request headers can override them.
 */
export interface ClientInit {
  /** Base URL applied to all requests issued by this client (e.g. `https://api.example.com`). */
  baseURL: string
  /** Default headers applied to every request unless explicitly overridden at call time. */
  defaultHeaders: Record<string, string>
}

/**
 * Internal exhaustiveness helper for `switch` statements.
 *
 * @param x - A value that should be statically typed as `never`.
 * @throws Always throws with the unsupported method value in the message.
 *
 * @remarks
 * This enforces at compile time that all union members (here: HTTP methods)
 * are handled. If a new method is added to `BuiltRequest['method']`, the
 * compiler will flag the missing branch.
 */
function assertUnreachable(x: never): never {
  throw new Error(`ApiClientFactory.send: unsupported HTTP method ${String(x)}`)
}

/**
 * Factory/dispatcher for API requests.
 *
 * @remarks
 * - Centralizes creation of {@link ApiClient} with required `baseURL` and `defaultHeaders`.
 * - Provides a single, type-safe entry point to execute a {@link BuiltRequest} via the correct HTTP verb.
 * - Uses an exhaustive `switch` so adding a new verb forces a compile-time update.
 *
 * @design
 * Keep this class free of business logic; it should only translate a `BuiltRequest`
 * into the corresponding {@link ApiClient} call. Authentication, retries, and
 * response validation belong in higher layers (builders/validators/middleware).
 */
export default class ApiClientFactory {
  /**
   * Construct a new {@link ApiClient} with fixed base URL and default headers.
   *
   * @param init - Configuration containing `baseURL` and `defaultHeaders`.
   * @returns A ready-to-use {@link ApiClient}.
   *
   * @example
   * ```ts
   * const client = ApiClientFactory.create({
   *   baseURL: 'https://api.example.com',
   *   defaultHeaders: { 'x-tenant': 'demo' },
   * })
   * ```
   */
  static create(init: ClientInit): ApiClient {
    return new ApiClient({
      baseURL: init.baseURL,
      defaultHeaders: init.defaultHeaders,
    })
  }

  /**
   * Execute a pre-built request using the provided client.
   *
   * @param client - The {@link ApiClient} instance used to send the request.
   * @param req - The {@link BuiltRequest} describing method, path, and request options.
   * @returns The Playwright {@link APIResponse} from the underlying request.
   *
   * @remarks
   * - Dispatches to the correct verb-specific method on {@link ApiClient}.
   * - Covers: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, `OPTIONS`.
   * - Falls back to {@link assertUnreachable} if an unknown method is encountered.
   *
   * @example
   * ```ts
   * const res = await ApiClientFactory.send(client, {
   *   method: 'POST',
   *   path: '/users',
   *   options: { data: { name: 'Alice' } },
   * })
   * expect(res.status()).toBe(201)
   * ```
   */
  static async send(client: ApiClient, req: BuiltRequest): Promise<APIResponse> {
    const { method, path, options } = req

    switch (method) {
      case 'GET':
        return client.get(path, options)
      case 'POST':
        return client.post(path, options)
      case 'PUT':
        return client.put(path, options)
      case 'DELETE':
        return client.delete(path, options)
      case 'PATCH':
        return client.patch(path, options)
      case 'HEAD':
        return client.head(path, options)
      case 'OPTIONS':
        return client.options(path, options)
      default:
        return assertUnreachable(method)
    }
  }
}
