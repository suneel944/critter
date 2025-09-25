// src/framework/index.ts

/* ───────────────────── Config ───────────────────── */
export { default as ConfigManager } from './config/ConfigManager'
export type { EnvironmentConfig } from './config/ConfigManager'
/* ──────────────────── Factories ─────────────────── */
export { default as AdapterFactory } from './factories/AdapterFactory'
export { default as ApiClientFactory } from './factories/ApiClientFactory'
export { default as ProviderFactory } from './factories/ProviderFactory'

/* ───────────────────── Brokers ──────────────────── */
export { default as DeviceBroker } from './brokers/DeviceBroker'

/* ───────────────────── API layer ────────────────── */
export { default as ApiClient } from './api/clients/ApiClient'
export { default as ResponseValidator } from './api/ResponseValidator'
export { default as RequestBuilder } from './api/builders/RequestBuilder'
export type { BuiltRequest } from './api/builders/RequestBuilder'

/* ──────────────────── Adapters ──────────────────── */
// Exporting classes is fine; adapters remain pure (no provider/env coupling)
export { AppiumAdapter } from './adapters/AppiumAdapter'
export { PlaywrightAdapter } from './adapters/PlaywrightAdapter'

/* ─────────────────── Capabilities ───────────────── */
export { CapabilityBuilder } from './capabilities/CapabilityBuilder'
export type { Caps } from './capabilities/CapabilityBuilder'

/* ──────────────────── Providers ─────────────────── */
// If you want stricter boundaries, you can stop exporting these
// and force callers to use DeviceBroker/ProviderFactory only.
export { LocalProvider } from './providers/LocalProvider'
export { BrowserStackProvider } from './providers/BrowserStackProvider'
export { SauceLabsProvider } from './providers/SauceLabsProvider'

/* ──────────────────── Utilities ─────────────────── */
export { default as Logger } from './logging/Logger'
export { default as DataGenerator } from './shared/DataGenerator'

/* ───────────────── Shared ports & types ─────────── */
export type { IAdapter } from './shared/ports/IAdapter'
export type {
  IDeviceProvider,
  ProviderOptions,
  MobileSession,
  MobileCapsInput,
  Platform,
} from './shared/ports/IDeviceProvider'
