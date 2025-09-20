import type { APIRequestContext } from "playwright";
import HeaderBuilder from "./HeaderBuilder";
import type { AuthStrategy, AuthContext, HttpMethod } from "./AuthBuilder";

/**
 * Playwright request options plus optional shared context for
 * cookie/header reuse across multiple requests.
 */
type PWRequestOptions = NonNullable<Parameters<APIRequestContext["get"]>[1]>;
type RequestOptions = PWRequestOptions & { context?: APIRequestContext };
type MultipartType = NonNullable<RequestOptions["multipart"]>;

/**
 * Immutable shape of a built request produced by {@link RequestBuilder}.
 *
 * @typeParam M - HTTP method type.
 */
export interface BuiltRequest<M extends HttpMethod = HttpMethod> {
  /** HTTP method (GET, POST, PUT, etc.) */
  method: M;
  /** Request path relative to the base URL. */
  path: string;
  /** Playwright request options to be passed to an {@link ApiClient}. */
  options: RequestOptions;
}

/**
 * Fluent builder for constructing API requests.
 *
 * @remarks
 * - Encapsulates query params, headers, auth strategies, and body payloads.
 * - Produces a typed {@link BuiltRequest} for execution by {@link ApiClientFactory}.
 * - Supports all HTTP methods with convenience factories (`get`, `post`, etc.).
 * - Enforces only one body shape per request (data/json/form/multipart).
 *
 * @example
 * ```ts
 * const req = RequestBuilder.post("/users")
 *   .json({ name: "Alice" })
 *   .header("x-tenant-id", "123")
 *   .auth_(new OAuth2Strategy(), { scope: "read" })
 *   .build()
 * ```
 */
export default class RequestBuilder<M extends HttpMethod = "GET"> {
  private method!: M;
  private path!: string;

  private params: Record<string, string | number | boolean> = {};
  private headers = new HeaderBuilder();
  private auth?: AuthStrategy;
  private authCtx: Omit<AuthContext, "path" | "method"> = {};
  private ctx?: APIRequestContext;

  // Body shapes – only one should be used per request.
  private dataBody?: unknown;
  private jsonBody?: unknown;
  private formBody?: Record<string, string>;
  private multipartBody?: MultipartType;

  // Extra Playwright options (timeout, failOnStatusCode, ignoreHTTPSErrors, etc.)
  private extra: Partial<RequestOptions> = {};

  /* ------------------------------ factories ------------------------------ */

  /** Create a GET request builder. */
  static get(path: string) {
    return new RequestBuilder<"GET">().method_("GET").path_(path);
  }
  /** Create a POST request builder. */
  static post(path: string) {
    return new RequestBuilder<"POST">().method_("POST").path_(path);
  }
  /** Create a PUT request builder. */
  static put(path: string) {
    return new RequestBuilder<"PUT">().method_("PUT").path_(path);
  }
  /** Create a DELETE request builder. */
  static delete(path: string) {
    return new RequestBuilder<"DELETE">().method_("DELETE").path_(path);
  }
  /** Create a PATCH request builder. */
  static patch(path: string) {
    return new RequestBuilder<"PATCH">().method_("PATCH").path_(path);
  }
  /** Create a HEAD request builder. */
  static head(path: string) {
    return new RequestBuilder<"HEAD">().method_("HEAD").path_(path);
  }
  /** Create an OPTIONS request builder. */
  static options(path: string) {
    return new RequestBuilder<"OPTIONS">().method_("OPTIONS").path_(path);
  }

  /* ------------------------------- chaining ------------------------------ */

  /**
   * Set the HTTP method.
   *
   * @typeParam T - Narrowed HTTP method type.
   */
  method_<T extends HttpMethod>(m: T): RequestBuilder<T> {
    // @ts-expect-error narrowing generic instance on purpose
    this.method = m;
    // @ts-expect-error return narrowed builder
    return this;
  }

  /** Set the request path. */
  path_(p: string) {
    this.path = p;
    return this;
  }

  /** Reuse a Playwright APIRequestContext (keeps cookies/headers). */
  context(ctx: APIRequestContext) {
    this.ctx = ctx;
    return this;
  }

  /** Add a single query parameter. */
  query(name: string, value: string | number | boolean) {
    this.params[name] = value;
    return this;
  }

  /** Merge multiple query parameters. */
  queries(obj: Record<string, string | number | boolean> = {}) {
    Object.assign(this.params, obj);
    return this;
  }

  /** Add a single header (case-insensitive). */
  header(name: string, value: string) {
    this.headers.add(name, value);
    return this;
  }

  /** Merge multiple headers. */
  headers_(obj: Record<string, string> = {}) {
    this.headers.addAll(obj);
    return this;
  }

  /**
   * Attach an authentication strategy with optional context.
   *
   * @param strategy - The auth strategy to use.
   * @param ctx - Extra context values such as tenant/scope/audience.
   */
  auth_(strategy: AuthStrategy, ctx?: Omit<AuthContext, "path" | "method">) {
    this.auth = strategy;
    if (ctx) this.authCtx = { ...this.authCtx, ...ctx };
    return this;
  }

  /* ------------------------------- body helpers ------------------------------- */

  /** Attach raw `data` body (form-encoded or multipart). */
  data(v: unknown) {
    this.dataBody = v;
    this.jsonBody = undefined;
    this.formBody = undefined;
    this.multipartBody = undefined;
    return this;
  }

  /** Attach a JSON body (auto-serialized). */
  json(v: unknown) {
    this.jsonBody = v;
    this.dataBody = undefined;
    this.formBody = undefined;
    this.multipartBody = undefined;
    return this;
  }

  /** Attach a URL-encoded form body. */
  form(v: Record<string, string>) {
    this.formBody = v;
    this.dataBody = undefined;
    this.jsonBody = undefined;
    this.multipartBody = undefined;
    return this;
  }

  /** Attach a multipart form body. */
  multipart(v: MultipartType) {
    this.multipartBody = v;
    this.dataBody = undefined;
    this.jsonBody = undefined;
    this.formBody = undefined;
    return this;
  }

  /** Merge additional Playwright request options. */
  options(opts: Partial<RequestOptions>) {
    Object.assign(this.extra, opts);
    return this;
  }

  /* --------------------------------- build -------------------------------- */

  /**
   * Finalize and build a {@link BuiltRequest}.
   *
   * @returns A fully constructed request object containing method, path, and options.
   * @throws If `method` or `path` have not been set.
   */
  public async build(): Promise<BuiltRequest<M>> {
    if (!this.method) throw new Error("RequestBuilder: method is required");
    if (!this.path) throw new Error("RequestBuilder: path is required");

    const ctxForAuth: AuthContext = {
      ...this.authCtx,
      path: this.path,
      method: this.method,
    };
    const authHeaders = this.auth ? await this.auth.headers(ctxForAuth) : {};
    const headers = this.headers.addAll(authHeaders).build();

    // HEAD & OPTIONS must not carry a body – drop any body parts defensively.
    const bodyAllowed = this.method !== "HEAD" && this.method !== "OPTIONS";

    const options: RequestOptions = {
      ...(Object.keys(headers).length ? { headers } : {}),
      ...(Object.keys(this.params).length ? { params: this.params } : {}),
      ...(bodyAllowed && this.dataBody !== undefined
        ? { data: this.dataBody }
        : {}),
      ...(bodyAllowed && this.jsonBody !== undefined
        ? { json: this.jsonBody }
        : {}),
      ...(bodyAllowed && this.formBody ? { form: this.formBody } : {}),
      ...(bodyAllowed && this.multipartBody
        ? { multipart: this.multipartBody }
        : {}),
      ...(this.ctx ? { context: this.ctx } : {}),
      ...this.extra,
    };

    return { method: this.method, path: this.path, options };
  }
}
