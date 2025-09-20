import { request, type APIRequestContext, type APIResponse } from "playwright";

/**
 * Options supported by Playwright's verb-based methods (e.g. `ctx.get`).
 * @internal
 */
type PWVerbOptions = NonNullable<Parameters<APIRequestContext["get"]>[1]>;

/**
 * Options supported by Playwright's `fetch` method.
 * @internal
 */
type PWFetchOptions = NonNullable<Parameters<APIRequestContext["fetch"]>[1]>;

/**
 * Extended options for verb-based methods.
 *
 * @remarks
 * You may pass an existing {@link APIRequestContext} via `context` to reuse
 * cookies, auth headers, and connections across calls. If omitted, the client
 * will create a new context lazily and keep it alive until {@link ApiClient.dispose}
 * is called (see ownership rules below).
 */
type RequestOptions = PWVerbOptions & { context?: APIRequestContext };

/**
 * Extended options for `options()` requests (implemented via `fetch`).
 *
 * @remarks
 * Same ownership semantics as {@link RequestOptions}.
 */
type OptionsRequestOptions = PWFetchOptions & { context?: APIRequestContext };

/**
 * Lightweight API client over Playwright's {@link APIRequestContext}.
 *
 * @remarks
 * ### Lifecycle & ownership
 * - **Caller-provided context** (`options.context`): *caller* owns disposal.
 *   The client will **not** track or dispose it.
 * - **Client-created context** (no `options.context`): the client creates a
 *   short-lived context on demand, **tracks it internally**, and defers
 *   disposal until {@link ApiClient.dispose} is called. This guarantees the
 *   response body can be read (e.g., `response.text()` / `response.json()`)
 *   by validators after the request completes.
 *
 * ### Parallel testing
 * - Each `ApiClient` instance keeps its own set of contexts; instances are
 *   isolated across workers/tests. Using this class from Playwright workers is
 *   safe: the Node event loop is single-threaded and `Set.add/delete` are atomic.
 *
 * ### Performance
 * - For maximum reuse (TLS keep-alive, cookies), prefer passing a shared
 *   `options.context` that you create once in a fixture and dispose in the
 *   fixture’s cleanup; or keep one `ApiClient` per test/worker and call
 *   {@link ApiClient.dispose} in cleanup.
 *
 * ### Examples
 * #### Quick GET with auto-managed context
 * ```ts
 * const client = new ApiClient({
 *   baseURL: "https://api.example.com",
 *   defaultHeaders: { "x-tenant": "acme" }
 * })
 * const res = await client.get("/users/1")
 * expect(res.status()).toBe(200)
 * await client.dispose() // important in tests/fixtures
 * ```
 *
 * #### Reusing a shared context across calls
 * ```ts
 * const ctx = await request.newContext({
 *   baseURL: "https://api.example.com",
 *   extraHTTPHeaders: { Authorization: "Bearer TOKEN" }
 * })
 * const client = new ApiClient({ baseURL: "", defaultHeaders: {} })
 * await client.post("/login", { context: ctx, data: { user: "u", pass: "p" } })
 * const me = await client.get("/me", { context: ctx })
 * await ctx.dispose() // caller owns it
 * ```
 */
export default class ApiClient {
  /** Base URL used when creating client-owned contexts. */
  private readonly baseURL: string;
  /** Default headers applied when creating client-owned contexts. */
  private readonly defaultHeaders: Record<string, string>;
  /**
   * Contexts created by this client (owned by the client).
   *
   * @remarks
   * Only contexts created internally are tracked. Contexts provided by the
   * caller via `options.context` are *not* tracked and will not be disposed here.
   */
  private readonly _ownedContexts = new Set<APIRequestContext>();

  /**
   * Construct a new `ApiClient`.
   *
   * @param init.baseURL - Base URL used for client-owned contexts.
   * @param init.defaultHeaders - Default HTTP headers for client-owned contexts.
   */
  constructor(init: {
    baseURL: string;
    defaultHeaders: Record<string, string>;
  }) {
    this.baseURL = init.baseURL;
    this.defaultHeaders = init.defaultHeaders;
  }

  /**
   * Ensure a usable {@link APIRequestContext} and invoke a request function.
   *
   * @param ctx - Optional existing context to reuse.
   * @param fn  - Function that performs the request(s) using the context.
   * @returns Result of `fn`.
   *
   * @remarks
   * - If `ctx` is provided, it is reused and **not** tracked or disposed here.
   * - If `ctx` is omitted, a new context is created with `baseURL` and
   *   `defaultHeaders`, **tracked** in {@link ApiClient._ownedContexts}, and
   *   left alive so responses remain readable by callers. Dispose later via
   *   {@link ApiClient.dispose}.
   *
   * This contract avoids “Response has been disposed” errors when validators
   * call `response.text()`/`response.json()` after the request returns.
   */
  private async withContext<T>(
    ctx: APIRequestContext | undefined,
    fn: (c: APIRequestContext) => Promise<T>,
  ): Promise<T> {
    let context = ctx;
    if (!context) {
      context = await request.newContext({
        baseURL: this.baseURL,
        extraHTTPHeaders: this.defaultHeaders,
      });
      this._ownedContexts.add(context);
    }
    return await fn(context);
  }

  /**
   * Dispose all contexts created and owned by this client.
   *
   * @throws AggregateError if one or more disposals fail.
   *
   * @remarks
   * Call this from your test/fixture cleanup. Caller-provided contexts
   * (passed via `options.context`) are never disposed here.
   */
  public async dispose(): Promise<void> {
    const errors: unknown[] = [];
    for (const ctx of this._ownedContexts) {
      try {
        await ctx.dispose();
      } catch (e) {
        errors.push(e);
      }
    }
    this._ownedContexts.clear();
    if (errors.length) {
      throw new AggregateError(errors, "ApiClient.dispose() failed!");
    }
  }

  /* ------------------------------ VERBS ------------------------------ */

  /**
   * Perform an HTTP **GET** request.
   *
   * @param path - Request path (resolved against the context’s `baseURL`).
   * @param options - Playwright request options plus optional `context`.
   * @returns The Playwright {@link APIResponse}.
   */
  public async get(
    path: string,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    const { context, ...opts } = options;
    return this.withContext(context, (ctx) => ctx.get(path, opts));
  }

  /**
   * Perform an HTTP **POST** request.
   *
   * @param path - Request path.
   * @param options - Playwright request options plus optional `context`.
   */
  public async post(
    path: string,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    const { context, ...opts } = options;
    return this.withContext(context, (ctx) => ctx.post(path, opts));
  }

  /** Perform an HTTP **PUT** request. */
  public async put(
    path: string,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    const { context, ...opts } = options;
    return this.withContext(context, (ctx) => ctx.put(path, opts));
  }

  /** Perform an HTTP **DELETE** request. */
  public async delete(
    path: string,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    const { context, ...opts } = options;
    return this.withContext(context, (ctx) => ctx.delete(path, opts));
  }

  /** Perform an HTTP **PATCH** request. */
  public async patch(
    path: string,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    const { context, ...opts } = options;
    return this.withContext(context, (ctx) => ctx.patch(path, opts));
  }

  /**
   * Perform an HTTP **HEAD** request.
   *
   * @remarks
   * HEAD must not have a body. Playwright ignores body fields for HEAD; other
   * options (headers, params, timeout, etc.) are forwarded.
   */
  public async head(
    path: string,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    const { context, ...opts } = options;
    return this.withContext(context, (ctx) => ctx.head(path, opts));
  }

  /**
   * Perform an HTTP **OPTIONS** request.
   *
   * @remarks
   * Implemented via `ctx.fetch(path, { ...opts, method: "OPTIONS" })`.
   * Useful for CORS preflight checks or capability discovery.
   */
  public async options(
    path: string,
    options: OptionsRequestOptions = {},
  ): Promise<APIResponse> {
    const { context, ...opts } = options;
    return this.withContext(context, (ctx) =>
      ctx.fetch(path, { ...opts, method: "OPTIONS" }),
    );
  }
}
