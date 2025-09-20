/**
 * Fluent builder for constructing HTTP headers.
 *
 * @remarks
 * - Normalizes all header names to lowercase for consistency.
 * - Supports adding single headers, merging multiple headers,
 *   and building the final header object.
 *
 * Typical usage:
 * ```ts
 * const headers = new HeaderBuilder()
 *   .add("Authorization", "Bearer token")
 *   .addAll({ "X-Tenant": "abc", "Content-Type": "application/json" })
 *   .build()
 * ```
 */
export default class HeaderBuilder {
  /** Internal header map (lowercased keys). */
  private h: Record<string, string> = {};

  /**
   * Add a single header (key will be normalized to lowercase).
   *
   * @param name - Header name.
   * @param value - Header value.
   * @returns The builder for chaining.
   */
  add(name: string, value: string) {
    this.h[name.toLowerCase()] = value;
    return this;
  }

  /**
   * Merge multiple headers into the builder.
   *
   * @param obj - Object containing header key–value pairs.
   * @returns The builder for chaining.
   *
   * @example
   * ```ts
   * builder.addAll({ "Accept": "application/json", "X-Env": "staging" })
   * ```
   */
  addAll(obj: Record<string, string> = {}) {
    for (const [k, v] of Object.entries(obj)) this.add(k, v);
    return this;
  }

  /**
   * Build the final header object.
   *
   * @returns A record of all accumulated headers with lowercase keys.
   */
  build() {
    return this.h;
  }
}
