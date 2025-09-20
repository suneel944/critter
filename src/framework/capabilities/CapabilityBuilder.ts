/**
 * Final (immutable) capabilities shape exposed to callers.
 *
 * @remarks
 * Values remain `unknown` to avoid leaking provider-specific types.
 * Use {@link CapabilityBuilder.build} to produce this form.
 */
export type Caps = Readonly<Record<string, unknown>>

/**
 * Internal mutable shape with a safe index signature.
 *
 * @remarks
 * This is the working object mutated by {@link CapabilityBuilder}
 * before producing a frozen {@link Caps}.
 */
type MutableCaps = {
  browserName?: string
  platformName?: string
  "appium:automationName"?: string
  [key: string]: unknown
}

/**
 * Narrow unknown to a plain object (record).
 */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

/**
 * Safe JSON.parse that never returns `any`.
 *
 * @returns `unknown` if parsing succeeds, `undefined` if parsing fails.
 */
function safeJsonParse(s: string): unknown {
  try {
    return JSON.parse(s) as unknown
  } catch {
    return undefined
  }
}

/**
 * Fluent builder for constructing Appium/WebDriver capabilities.
 *
 * @remarks
 * - Provides convenience methods for common mobile/web keys.
 * - Supports arbitrary capability injection via {@link option}, {@link appium}, and {@link vendor}.
 * - Allows merging JSON config from environment variables.
 * - Produces either an immutable {@link Caps} or a mutable object.
 *
 * Typical usage:
 * ```ts
 * const caps = CapabilityBuilder.android()
 *   .deviceName("Pixel_8")
 *   .platformVersion("14.0")
 *   .app("/path/to/app.apk")
 *   .build()
 * ```
 */
export class CapabilityBuilder {
  private caps: MutableCaps

  private constructor(base: MutableCaps) {
    this.caps = { ...base }
  }

  /**
   * Android base (UiAutomator2 by default).
   *
   * @param automationName - Automation backend to use (`UiAutomator2` or `Espresso`).
   */
  static android(
    automationName: "UiAutomator2" | "Espresso" = "UiAutomator2",
  ): CapabilityBuilder {
    return new CapabilityBuilder({
      platformName: "Android",
      "appium:automationName": automationName,
    })
  }

  /**
   * iOS base (XCUITest by default).
   *
   * @param automationName - Automation backend to use (`XCUITest`).
   */
  static ios(automationName: "XCUITest" = "XCUITest"): CapabilityBuilder {
    return new CapabilityBuilder({
      platformName: "iOS",
      "appium:automationName": automationName,
    })
  }

  // ---------- Common ----------

  /** Platform version (e.g. "14.0"). */
  platformVersion(v: string) {
    this.caps["appium:platformVersion"] = v
    return this
  }

  /** Device name (e.g. "Pixel_8"). */
  deviceName(v: string) {
    this.caps["appium:deviceName"] = v
    return this
  }

  /** Device UDID (for physical devices). */
  udid(v: string) {
    this.caps["appium:udid"] = v
    return this
  }

  /** Device orientation (portrait or landscape). */
  orientation(v: "PORTRAIT" | "LANDSCAPE") {
    this.caps["appium:orientation"] = v
    return this
  }

  /** Language code (ISO format). */
  language(v: string) {
    this.caps["appium:language"] = v
    return this
  }

  /** Locale code (ISO format). */
  locale(v: string) {
    this.caps["appium:locale"] = v
    return this
  }

  /** Prevent app reset between sessions. */
  noReset(v = true) {
    this.caps["appium:noReset"] = v
    return this
  }

  /** Force a full app reset between sessions. */
  fullReset(v = true) {
    this.caps["appium:fullReset"] = v
    return this
  }

  // ---------- Native app ----------

  /** Path or identifier of the app under test. */
  app(path: string) {
    this.caps["appium:app"] = path
    return this
  }

  /** iOS bundle identifier. */
  bundleId(v: string) {
    this.caps["appium:bundleId"] = v
    return this
  }

  /** Android app package name. */
  appPackage(v: string) {
    this.caps["appium:appPackage"] = v
    return this
  }

  /** Android app activity name. */
  appActivity(v: string) {
    this.caps["appium:appActivity"] = v
    return this
  }

  // ---------- Mobile web ----------

  /**
   * Browser name for mobile web testing.
   * Overloads give IntelliSense for common values while allowing any string.
   */
  browserName(v: "Chrome" | "Chromium" | "Safari"): this
  browserName(v: string): this
  browserName(v: string) {
    this.caps.browserName = v
    return this
  }

  // ---------- Arbitrary ----------

  /** Add any raw top-level capability key safely. */
  option(k: string, v: unknown) {
    this.caps[k] = v
    return this
  }

  /** Add any `appium:*` namespaced capability safely. */
  appium(k: string, v: unknown) {
    this.caps[`appium:${k}`] = v
    return this
  }

  // ---------- Ergonomics ----------

  /** Set only if value is not null/undefined. */
  setIf(k: string, v: unknown): this {
    if (v !== undefined && v !== null) this.caps[k] = v
    return this
  }

  /** Remove a key if present. */
  unset(k: string) {
    delete this.caps[k]
    return this
  }

  /** Merge/extend with a plain object (e.g., from JSON). */
  merge(obj: Record<string, unknown>) {
    this.caps = { ...this.caps, ...obj }
    return this
  }

  /**
   * Merge JSON from an environment variable.
   *
   * @param envVar - Environment variable name containing JSON.
   */
  fromEnvJSON(envVar: string) {
    const raw = process.env[envVar]
    if (raw) {
      const parsed: unknown = safeJsonParse(raw)
      if (isRecord(parsed)) this.merge(parsed)
    }
    return this
  }

  /**
   * Vendor namespace merge (e.g., `bstack:options`, `sauce:options`).
   */
  vendor(ns: string, opts: Record<string, unknown>) {
    const current = this.caps[ns]
    const base = isRecord(current) ? current : {}
    this.caps[ns] = { ...base, ...opts }
    return this
  }

  /**
   * Vendor options loaded from an env var containing JSON.
   *
   * @param ns - Vendor namespace (e.g. `bstack:options`).
   * @param envVar - Environment variable name containing JSON.
   */
  vendorFromEnv(ns: string, envVar: string) {
    const raw = process.env[envVar]
    if (raw) {
      const parsed: unknown = safeJsonParse(raw)
      if (isRecord(parsed)) this.vendor(ns, parsed)
    }
    return this
  }

  /** Final immutable capabilities object. */
  build(): Caps {
    return Object.freeze({ ...this.caps })
  }

  /** Mutable clone (useful if a caller must still tweak keys). */
  buildMutable(): Record<string, unknown> {
    return { ...this.caps }
  }
}

// ---- Bound factories (avoid @typescript-eslint/unbound-method) ----

/** Helper type alias for Android builder arguments. */
type AndroidArgs = Parameters<typeof CapabilityBuilder.android>

/** Helper type alias for iOS builder arguments. */
type IOSArgs = Parameters<typeof CapabilityBuilder.ios>

/**
 * Pre-bound convenience factories for Android and iOS.
 *
 * @example
 * ```ts
 * import { caps } from "./CapabilityBuilder"
 *
 * const androidCaps = caps.android().deviceName("Pixel").build()
 * const iosCaps = caps.ios().bundleId("com.example.app").build()
 * ```
 */
export const caps = {
  android: (...args: AndroidArgs) => CapabilityBuilder.android(...args),
  ios: (...args: IOSArgs) => CapabilityBuilder.ios(...args),
}
