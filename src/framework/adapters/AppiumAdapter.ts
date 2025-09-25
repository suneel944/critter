import type DeviceBroker from '../brokers/DeviceBroker'
import Logger from '../logging/Logger'
import type { IAdapter } from '../shared/ports/IAdapter'
import type {
  MobileSession,
  MobileCapsInput,
} from '../shared/ports/IDeviceProvider'
import type { Browser as WdioBrowser } from 'webdriverio'

/**
 * Adapter initialization options accepted by {@link AppiumAdapter.init}.
 *
 * @remarks
 * The broker accepts a flexible union:
 * - raw provider options (key–value bag),
 * - strongly typed caps,
 * - or a fluent capability builder from your framework.
 *
 * The adapter does not interpret these; they are forwarded to the broker.
 *
 * @public
 */
type MobileInit = MobileCapsInput

/**
 * Session binding payload accepted by {@link AppiumAdapter.bind}.
 *
 * @remarks
 * You may pass:
 * - a full {@link MobileSession} object (preferred), or
 * - an object with only a raw WebdriverIO `driver` (legacy/low-level cases).
 *
 * @public
 */
type MobileBind = MobileSession | { driver: WdioBrowser }

/**
 * Action names supported by {@link AppiumAdapter.execute}.
 *
 * @public
 */
type MobileActions = 'tap' | 'type' | 'getText' | 'back' | 'screenshot'

/**
 * Parameter map for actions supported by {@link AppiumAdapter.execute}.
 *
 * @public
 */
type MobileParams = {
  /** Tap/click a target element. */
  tap: { selector: string }
  /** Type text into a target element (clears or appends depending on platform default). */
  type: { selector: string; text: string }
  /** Get the visible text content of a target element. */
  getText: { selector: string }
  /** Navigate one step back (system back). */
  back: void
  /** Capture a screenshot (returns a binary buffer). */
  screenshot: void
}

/**
 * Result map for actions supported by {@link AppiumAdapter.execute}.
 *
 * @public
 */
type MobileResults = {
  tap: void
  type: void
  getText: string
  back: void
  screenshot: Buffer
}

/**
 * Optional navigation parameters for {@link AppiumAdapter.navigate}.
 *
 * @remarks
 * Native apps typically do not use a URL target. Pass an empty string for
 * `target` and provide one of the following options:
 *
 * - **Deep link** (Android/iOS): launches a scheme URL.
 * - **Android startActivity**: starts a specific Android activity.
 *
 * @public
 */
type MobileNavigate =
  | void
  | { deepLink: string; androidPackage?: string; iosBundleId?: string }
  | { androidStartActivity: { appPackage: string; appActivity: string } }

/**
 * **AppiumAdapter** — a thin, pure façade over {@link DeviceBroker}.
 *
 * @remarks
 * Responsibilities:
 * - Provides a unified, tool-agnostic interface for mobile actions.
 * - Delegates all provider selection, capability normalization, secrets, retries,
 *   and lifecycle policy to {@link DeviceBroker}.
 * - Does not read environment variables or import concrete providers.
 *
 * Design invariants:
 * - No `process.env` usage.
 * - No direct imports of BrowserStack/Sauce/Local providers.
 * - Session ownership is tracked so teardown is correct for both `init()` and `bind()` flows.
 *
 * @public
 */
export class AppiumAdapter
  implements
    IAdapter<
      MobileInit,       // TInit
      MobileBind,       // TBind
      MobileNavigate,   // TNavigate
      MobileActions,    // TActions
      MobileParams,     // TParams
      MobileResults     // TResults
    >
{
  /** Underlying broker that owns provider selection and lifecycle policy. */
  private readonly broker: DeviceBroker

  /**
   * Current mobile session (if any).
   *
   * Note: with `exactOptionalPropertyTypes: true`, an optional property (`?`)
   * cannot be directly assigned `undefined`. Use an explicit union instead.
   */
  private session: MobileSession | undefined

  /**
   * Whether this adapter created the session (true) or is bound to an external one (false).
   * Controls teardown semantics.
   */
  private ownsSession = false

  /**
   * Construct an {@link AppiumAdapter}.
   *
   * @param broker - The device broker that creates/releases sessions.
   */
  constructor(broker: DeviceBroker) {
    this.broker = broker
  }

  /**
   * Launch a new mobile session via the broker.
   *
   * @param options - Provider options, strongly-typed capabilities, or a capability builder.
   * @returns Resolves when the session is available and bound to the adapter.
   *
   * @remarks
   * Use this in flows where the adapter should **own** the session lifecycle.
   */
  async init(options?: MobileInit): Promise<void> {
    Logger.info({ component: 'AppiumAdapter', event: 'init.request' }, 'Requesting mobile session')
    this.session = await this.broker.getMobileSession(options ?? ({} as Record<string, unknown>))
    this.ownsSession = true
    Logger.info({ component: 'AppiumAdapter', event: 'init.ok' }, 'Mobile session acquired')
  }

  /**
   * Bind the adapter to an existing session.
   *
   * @param session - An existing {@link MobileSession} or an object containing a raw WDIO driver.
   * @returns Resolves when the adapter is bound.
   *
   * @remarks
   * Use this when sessions are created by a provider or another component
   * and the adapter should not own teardown.
   */
  async bind(session: MobileBind): Promise<void> {
    this.session = 'driver' in session ? { driver: session.driver } as MobileSession : session
    this.ownsSession = false
    Logger.info({ component: 'AppiumAdapter', event: 'bind' }, 'Bound to existing driver')
    return Promise.resolve()
  }

  /**
   * Navigate within a native context (optional).
   *
   * @param _target - Ignored for native apps; kept for interface parity.
   * @param params  - Navigation options (deep link or Android startActivity).
   * @returns Resolves when navigation is complete or immediately if no params supplied.
   */
  async navigate(_target: string, params?: MobileNavigate): Promise<void> {
    const driver = this.ensureDriver()
    if (!params) return

    // Deep link (Android/iOS)
    if ('deepLink' in params) {
      const args: Record<string, unknown> = { url: params.deepLink }
      if (params.androidPackage) args.package = params.androidPackage
      if (params.iosBundleId) args.bundleId = params.iosBundleId
      await driver.execute('mobile: deepLink', args)
      return
    }

    // Android: start activity
    if ('androidStartActivity' in params) {
      const { appPackage, appActivity } = params.androidStartActivity
      await driver.startActivity(appPackage, appActivity)
    }
  }

  /**
   * Execute a mobile action in a tool-agnostic manner.
   *
   * @typeParam A - One of {@link MobileActions}.
   * @param action - The action to perform.
   * @param params - Parameters for the action (typed via {@link MobileParams}).
   * @returns The typed result of the action (via {@link MobileResults}).
   */
  async execute<A extends MobileActions>(
    action: A,
    params?: MobileParams[A],
  ): Promise<MobileResults[A]> {
    const driver = this.ensureDriver()
    Logger.debug({ component: 'AppiumAdapter', action, params }, 'Execute action')

    switch (action) {
      case 'tap': {
        const p = params as MobileParams['tap']
        const el = this.find(driver, p.selector)
        await el.click()
        return undefined as MobileResults[A]
      }
      case 'type': {
        const p = params as MobileParams['type']
        const el = this.find(driver, p.selector)
        await el.setValue(p.text)
        return undefined as MobileResults[A]
      }
      case 'getText': {
        const p = params as MobileParams['getText']
        const el = this.find(driver, p.selector)
        const txt = await el.getText()
        return (txt ?? '') as MobileResults[A]
      }
      case 'back': {
        await driver.back()
        return undefined as MobileResults[A]
      }
      case 'screenshot': {
        const b64 = await driver.takeScreenshot()
        return Buffer.from(b64, 'base64') as MobileResults[A]
      }
      default:
        // Compile-time exhaustiveness via generics; at runtime keep a defensive check.
        throw new Error(`Unsupported action: ${String(action)}`)
    }
  }

  /**
   * Gracefully tear down the current session.
   *
   * @returns Resolves when teardown completes (best-effort and idempotent).
   *
   * @remarks
   * - If the adapter created the session (via {@link init}), it delegates teardown
   *   to the broker (policy-aware: pooling, retries, metrics).
   * - If the adapter is bound to an external session, it attempts a best-effort
   *   direct close without assumptions.
   */
  async teardown(): Promise<void> {
    Logger.info({ component: 'AppiumAdapter', event: 'teardown' }, 'Tearing down mobile session')

    if (this.session && this.ownsSession) {
      try {
        await this.broker.release(this.session)
      } catch (err) {
        Logger.warn({ component: 'AppiumAdapter', err }, 'Broker release failed; continuing')
      }
    } else if (this.session) {
      try {
        // Optional chain because not all Browser types expose deleteSession
        await this.session.driver.deleteSession?.()
      } catch (err) {
        Logger.warn({ component: 'AppiumAdapter', err }, 'Direct driver close failed; continuing')
      }
    }

    // With exactOptionalPropertyTypes, use an explicit union type (above) to allow this:
    this.session = undefined
    this.ownsSession = false

    Logger.info({ component: 'AppiumAdapter', event: 'teardown.ok' }, 'Mobile session torn down')
  }

  // ──────────────────────────────── Helpers ───────────────────────────────────

  /**
   * Ensure a driver is available.
   *
   * @throws If the adapter has not been initialized or bound.
   * @internal
   */
  private ensureDriver(): WdioBrowser {
    if (!this.session?.driver) throw new Error('AppiumAdapter is not initialized/bound')
    return this.session.driver
  }

  /**
   * Resolve selectors with pragmatic prefixes:
   *
   * - `id=foo`      → `id=foo`
   * - `xpath=//..`  → `//..`
   * - `acc=Login`   → `~Login` (accessibility id)
   * - `class=XCUI…` → `//XCUI…`
   * - `~Alias`      → `~Alias` (accessibility id)
   * - otherwise     → pass-through to WDIO `$`
   *
   * @param driver   - Active WDIO browser (Appium driver).
   * @param selector - Selector string with optional prefix.
   * @returns The located element handle.
   *
   * @internal
   */
  private find(driver: WdioBrowser, selector: string) {
    const s = selector.trim()
    if (s.startsWith('id=')) return driver.$(`id=${s.slice(3)}`)
    if (s.startsWith('xpath=')) return driver.$(s.slice(6))
    if (s.startsWith('acc=')) return driver.$(`~${s.slice(4)}`)
    if (s.startsWith('class=')) return driver.$(`//${s.slice(6)}`)
    if (s.startsWith('~')) return driver.$(s)
    return driver.$(s)
  }
}
