import { CapabilityBuilder, type Caps } from "../capabilities/CapabilityBuilder"

export type Platform = "android" | "ios"
export type MobileCapsInput = Caps | CapabilityBuilder | Record<string, unknown>

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v)
}

function pickPlatformName(caps?: Record<string, unknown>): string {
  if (!isRecord(caps)) return ""
  const pn1 =
    typeof caps.platformName === "string" ? caps.platformName : undefined
  const pn2Raw = caps["appium:platformName"]
  const pn2 = typeof pn2Raw === "string" ? pn2Raw : undefined
  return (pn1 ?? pn2 ?? "").trim().toLowerCase()
}

export function detectPlatformFromCaps(
  caps?: Record<string, unknown>,
): Platform {
  const pn = pickPlatformName(caps)
  return pn.includes("ios") ? "ios" : "android"
}

export function toBuilder(
  input: MobileCapsInput,
  platform: Platform,
): CapabilityBuilder {
  const base =
    platform === "ios" ? CapabilityBuilder.ios() : CapabilityBuilder.android()
  if (input instanceof CapabilityBuilder) return input
  if (isRecord(input)) {
    for (const [k, v] of Object.entries(input)) base.option(k, v)
  }
  return base
}

export function buildCaps(
  builder: CapabilityBuilder,
  mutable = true,
): Record<string, unknown> {
  return mutable
    ? builder.buildMutable()
    : (builder.build() as Record<string, unknown>)
}

/** Safely merge a vendor namespace (e.g., "bstack:options") with defaults.
 *  Caller-supplied values in the same namespace still win.
 */
export function mergeVendor(
  builder: CapabilityBuilder,
  ns: string,
  defaults: Record<string, unknown>,
): CapabilityBuilder {
  const currentRaw = builder.buildMutable()[ns]
  const current =
    currentRaw && typeof currentRaw === "object" && !Array.isArray(currentRaw)
      ? (currentRaw as Record<string, unknown>)
      : {}
  const merged = { ...defaults, ...current } // caller wins
  builder.option(ns, merged)
  return builder
}
