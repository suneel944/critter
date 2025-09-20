import type { IAdapter } from "./IAdapter";
import { PlaywrightAdapter } from "./PlaywrightAdapter";
import { AppiumAdapter } from "./AppiumAdapter";

/**
 * @packageDocumentation
 * Factory for creating UI/Mobile adapters in a type-safe and extensible way.
 *
 * ## Design
 * - Uses a strongly typed registry map: {@link AdapterKind} → constructor.
 * - Avoids `switch`/`default` fall-through and `never` typing issues.
 * - Enforces completeness: when you add a new {@link AdapterKind},
 *   TypeScript requires you to register it in the `registry`.
 *
 * ## Usage
 * ```ts
 * import AdapterFactory, { AdapterKind } from "./AdapterFactory"
 *
 * const kind: AdapterKind =
 *   process.env.ADAPTER === "appium" ? "appium" : "playwright"
 *
 * const adapter = AdapterFactory.create(kind)
 * await adapter.init()
 * await adapter.navigate("https://example.com")
 * await adapter.execute("click", { selector: "button.submit" })
 * await adapter.teardown()
 * ```
 */

/**
 * Finite set of adapter identifiers supported by the factory.
 *
 * @remarks
 * Add new literal members when introducing new adapters
 * (e.g. `"api"`, `"mobile-web"`). The {@link registry} must be
 * updated accordingly—TypeScript enforces this at compile time.
 *
 * @public
 */
export type AdapterKind = "playwright" | "appium";

/**
 * Registry mapping each {@link AdapterKind} to its concrete adapter class.
 *
 * @remarks
 * - The constructor signature `new () => IAdapter` guarantees
 *   that each entry produces an object conforming to {@link IAdapter}.
 * - To add a new adapter:
 *   1. Export its class (e.g. `export class MyAdapter implements IAdapter { ... }`)
 *   2. Extend {@link AdapterKind} with a new literal (`"my"`)
 *   3. Register it here: `{ ..., my: MyAdapter }`
 *
 * @internal
 */
const registry: Record<AdapterKind, new () => IAdapter> = {
  playwright: PlaywrightAdapter,
  appium: AppiumAdapter,
};

/**
 * Factory for instantiating adapters by kind.
 *
 * @remarks
 * Centralizes adapter construction logic and ensures the returned
 * instance satisfies the {@link IAdapter} contract.
 *
 * @example
 * ```ts
 * const adapter = AdapterFactory.create("appium")
 * // adapter is typed as IAdapter
 * ```
 *
 * @public
 */
export default class AdapterFactory {
  /**
   * Create an adapter instance for the given {@link AdapterKind}.
   *
   * @param kind - Adapter identifier (e.g. `"playwright"` or `"appium"`).
   * @returns A new instance implementing {@link IAdapter}.
   *
   * @remarks
   * Relies on the typed {@link registry}. If you add a new {@link AdapterKind}
   * but forget to register it, TypeScript will produce a compile-time error.
   */
  static create(kind: AdapterKind): IAdapter {
    const Ctor = registry[kind];
    return new Ctor();
  }
}
