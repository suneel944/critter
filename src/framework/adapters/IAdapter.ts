/**
 * Generic, type-safe adapter contract.
 *
 * @remarks
 * Adapters provide a unified abstraction over different automation tools
 * (e.g. Playwright, Appium) so higher-level framework code can interact
 * with them in a tool-agnostic way.
 *
 * @typeParam TInit     - Options accepted by {@link init}. For example, browser launch options.
 * @typeParam TBind     - Session/handle accepted by {@link bind}. For example, `{ page }`, `{ context }`, or `{ driver }`.
 * @typeParam TNavigate - Extra params for {@link navigate}, if any. Typically unused for native apps.
 * @typeParam TActions  - Union of supported action names (e.g. `"click"` | `"fill"` | `"tap"`).
 * @typeParam TParams   - Mapping from action name → parameter type.
 * @typeParam TResults  - Mapping from action name → result type.
 *
 * @example
 * ```ts
 * // Actions with and without parameters:
 * type Actions = "click" | "getText" | "title"
 *
 * interface Params {
 *   click:   { selector: string }
 *   getText: { selector: string }
 *   title:   void            // no params; pair with `params?: TParams[A]`
 * }
 *
 * interface Results {
 *   click:   void
 *   getText: string
 *   title:   string
 * }
 *
 * class MyAdapter implements IAdapter<
 *   { headless?: boolean },    // TInit
 *   { page: Page },            // TBind
 *   void,                      // TNavigate
 *   Actions,                   // TActions
 *   Params,                    // TParams
 *   Results                    // TResults
 * > {
 *   // ...
 * }
 * ```
 */
export interface IAdapter<
  TInit = unknown,
  TBind = unknown,
  TNavigate = unknown,
  TActions extends string = string,
  TParams extends Record<TActions, unknown> = Record<TActions, unknown>,
  TResults extends Record<TActions, unknown> = Record<TActions, unknown>
> {
  /**
   * Launch a brand-new local session.
   *
   * @param options - Tool-specific options for launching (browser launch options, device caps, etc.).
   * @remarks
   * Optional in provider-driven flows (e.g. when sessions come from BrowserStack/Sauce).
   */
  init(options?: TInit): Promise<void>

  /**
   * Attach/bind to an existing session created by a provider.
   *
   * @param session - Existing session handle (e.g. Page, BrowserContext, WebDriver driver).
   */
  bind(session: TBind): Promise<void>

  /**
   * Navigate/open context.
   *
   * @param target - Target resource (URL for web, deep link for native apps).
   * @param params - Optional navigation parameters (tool-specific).
   * @remarks
   * For native apps, this may be a no-op unless navigating to a webview or deep link.
   */
  navigate(target: string, params?: TNavigate): Promise<void>

  /**
   * Execute a tool-agnostic action.
   *
   * @typeParam A - Action name (must be in {@link TActions}).
   * @param action - The action to perform (e.g. `"click"`, `"fill"`, `"tap"`).
   * @param params - Parameters required for the action (typed via {@link TParams}).
   *                 Optional to support parameterless actions; for such actions set
   *                 the mapped type to `void` (or `undefined`) in {@link TParams}.
   * @returns The result of the action (typed via {@link TResults}).
   *
   * @example
   * ```ts
   * await adapter.execute("click",   { selector: "#submit" }) // params required
   * const t = await adapter.execute("title")                  // params omitted
   * ```
   */
  execute<A extends TActions>(action: A, params?: TParams[A]): Promise<TResults[A]>

  /**
   * Graceful cleanup.
   *
   * @remarks
   * Should close/release any sessions, contexts, or drivers and must not throw if already closed.
   */
  teardown(): Promise<void>
}
