import type { APIResponse } from "playwright";

/**
 * Allowed HTTP methods for request builders and auth context.
 */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD";

/**
 * Context passed to authentication strategies when generating headers.
 *
 * @remarks
 * - Carries the target `path` and `method` being invoked.
 * - Optionally includes higher-level metadata such as `tenant`, `scope`, or `audience`.
 * - `extras` can carry arbitrary key–value pairs for advanced strategies.
 */
export interface AuthContext {
  /** Optional service identifier. */
  service?: string;
  /** The request path (relative to base URL). */
  path: string;
  /** The HTTP method being executed. */
  method: HttpMethod;
  /** Optional tenant identifier. */
  tenant?: string;
  /** Optional OAuth scope string. */
  scope?: string;
  /** Optional OAuth audience string. */
  audience?: string;
  /** Arbitrary extra metadata. */
  extras?: Record<string, string | number | boolean>;
}

/**
 * Contract for all authentication strategies.
 *
 * @remarks
 * - `headers()` must return a header map with authentication information.
 * - `onAuthError()` may optionally handle an authentication error response
 *   and decide whether to retry (returning a resolved promise).
 */
export interface AuthStrategy {
  /**
   * Produce HTTP headers for authenticating a request.
   *
   * @param ctx - The request context including path, method, and optional metadata.
   * @returns A promise resolving to a record of header name/value pairs.
   */
  headers(ctx: AuthContext): Promise<Record<string, string>>;

  /**
   * Optional hook invoked when an authentication error occurs.
   *
   * @param ctx - The request context that triggered the error.
   * @param res - The API response returned by Playwright.
   * @returns A promise that may resolve to void. If the strategy retries,
   *          implementations can throw or log as needed.
   */
  onAuthError?(ctx: AuthContext, res: APIResponse): Promise<void>;
}

/**
 * Strategy that applies no authentication.
 *
 * @example
 * ```ts
 * const auth = new NoAuth()
 * const headers = await auth.headers({ path: "/ping", method: "GET" })
 * // => {}
 * ```
 */
export class NoAuth implements AuthStrategy {
  async headers(): Promise<Record<string, string>> {
    return {};
  }
}

/**
 * Strategy that applies an API key from an environment variable.
 *
 * @example
 * ```ts
 * process.env.API_KEY = "12345"
 * const auth = new ApiKeyAuth("x-api-key", "API_KEY")
 * const headers = await auth.headers({ path: "/users", method: "GET" })
 * // => { "x-api-key": "12345" }
 * ```
 */
export class ApiKeyAuth implements AuthStrategy {
  constructor(
    private header: string,
    private valueEnv: string,
  ) {}

  async headers() {
    const v = process.env[this.valueEnv] || "";
    if (!v) throw new Error(`Missing API key env: ${this.valueEnv}`);
    return { [this.header]: v };
  }
}

/**
 * Strategy that applies HTTP Basic Authentication.
 *
 * @remarks
 * - Reads username and password from environment variables.
 * - Encodes them as Base64 according to the Basic Auth spec.
 *
 * @example
 * ```ts
 * process.env.USER = "admin"
 * process.env.PASS = "secret"
 * const auth = new BasicAuth("USER", "PASS")
 * const headers = await auth.headers({ path: "/secure", method: "GET" })
 * // => { Authorization: "Basic YWRtaW46c2VjcmV0" }
 * ```
 */
export class BasicAuth implements AuthStrategy {
  constructor(
    private userEnv: string,
    private passEnv: string,
  ) {}

  async headers() {
    const u = process.env[this.userEnv] || "";
    const p = process.env[this.passEnv] || "";
    if (!u || !p) {
      throw new Error(
        `Missing basic creds envs: ${this.userEnv} and ${this.passEnv}`,
      );
    }
    return {
      Authorization: `Basic ${Buffer.from(`${u}:${p}`).toString("base64")}`,
    };
  }
}

/**
 * Strategy that applies a Bearer token from an environment variable.
 *
 * @example
 * ```ts
 * process.env.TOKEN = "abcdef"
 * const auth = new BearerAuth("TOKEN")
 * const headers = await auth.headers({ path: "/me", method: "GET" })
 * // => { Authorization: "Bearer abcdef" }
 * ```
 */
export class BearerAuth implements AuthStrategy {
  constructor(private token: string) {}

  async headers() {
    const t = process.env[this.token] || "";
    if (!t) throw new Error(`Missing bearer token env: ${this.token}`);
    return { Authorization: `Bearer ${t}` };
  }
}
