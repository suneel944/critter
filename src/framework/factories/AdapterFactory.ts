import { AppiumAdapter } from '../adapters/AppiumAdapter'
import { PlaywrightAdapter } from '../adapters/PlaywrightAdapter'
import type DeviceBroker from '../brokers/DeviceBroker'

/**
 * Discriminant used to select a concrete adapter implementation.
 * Extend this union when introducing a new adapter.
 *
 * @remarks
 * This is the single source of truth for adapter keys across the factory,
 * dependency map, and return-type map.
 */
export type AdapterKind = 'playwright' | 'appium'

/**
 * Per-adapter dependency contract.
 *
 * @remarks
 * Each key mirrors an {@link AdapterKind}. The value describes the exact
 * dependencies required to construct that adapter. Adapters that need
 * nothing should be typed as `void`.
 *
 * - `playwright` — no dependencies.
 * - `appium` — requires a {@link DeviceBroker} to provision mobile sessions.
 */
type AdapterDeps = {
  /** PlaywrightAdapter requires no external dependencies. */
  playwright: void
  /** AppiumAdapter requires a DeviceBroker for device/session lifecycle. */
  appium: { broker: DeviceBroker }
}

/**
 * Per-adapter return type mapping.
 *
 * @remarks
 * Keeps `create()` strongly typed: the returned instance matches the
 * requested {@link AdapterKind}.
 */
type AdapterMap = {
  playwright: PlaywrightAdapter
  appium: AppiumAdapter
}

/**
 * Builder function signatures per adapter kind.
 *
 * @remarks
 * This prevents wiring the wrong dependencies for an adapter at compile time.
 * If you add a new adapter and forget to align its deps, TypeScript will fail here.
 */
type BuilderMap = {
  [K in AdapterKind]: (deps: AdapterDeps[K]) => AdapterMap[K]
}

/**
 * Typed registry of adapter constructors.
 *
 * @remarks
 * This is the only place new adapters must be registered. The `satisfies`
 * clause guarantees each entry obeys the correct dependency and return types.
 */
const registry = {
  playwright: () => new PlaywrightAdapter(),
  appium: (deps: { broker: DeviceBroker }) => new AppiumAdapter(deps.broker),
} satisfies BuilderMap

/**
 * Factory for constructing UI/mobile adapters with explicit dependency injection.
 *
 * @remarks
 * - Enforces per-adapter dependency requirements at compile time.
 * - Call sites get precise return types (no `any`, no casts).
 * - To add an adapter:
 *   1) Extend {@link AdapterKind}.
 *   2) Add its deps to {@link AdapterDeps}.
 *   3) Add its return type to {@link AdapterMap}.
 *   4) Register a builder in {@link registry}.
 *
 * @example Create Playwright adapter (no dependencies)
 * ```ts
 * const ui = AdapterFactory.create('playwright')
 * // ui is a PlaywrightAdapter
 * ```
 *
 * @example Create Appium adapter (requires broker)
 * ```ts
 * const mobile = AdapterFactory.create('appium', { broker })
 * // mobile is an AppiumAdapter
 * ```
 */
export default class AdapterFactory {
  /**
   * Construct a {@link PlaywrightAdapter}.
   * @returns A fully-initialized PlaywrightAdapter instance.
   */
  static create(kind: 'playwright'): AdapterMap['playwright']

  /**
   * Construct an {@link AppiumAdapter}.
   * @param deps - Exact dependencies required by the Appium adapter.
   * @returns A fully-initialized AppiumAdapter instance.
   */
  static create(kind: 'appium', deps: AdapterDeps['appium']): AdapterMap['appium']

  /**
   * Runtime implementation. Prefer the typed overloads above at call sites.
   *
   * @typeParam K - The adapter kind discriminant.
   * @param kind - Which adapter to construct.
   * @param args - Dependencies required for the given adapter kind.
   * @returns The adapter instance corresponding to {@link AdapterKind}.
   */
  static create<K extends AdapterKind>(
    kind: K,
    ...args: AdapterDeps[K] extends void ? [] : [AdapterDeps[K]]
  ): AdapterMap[K] {
    if (kind === 'playwright') {
      return registry.playwright() as AdapterMap[K]
    }
    // K is 'appium' here; args[0] is guaranteed by the signature
    return registry.appium(args[0] as AdapterDeps['appium']) as AdapterMap[K]
  }
}
