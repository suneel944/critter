/**
 * dataGenerator provides utility functions for generating random test data.
 * Keeping data generation logic in one place helps maintain consistent
 * behaviour across tests and avoids repetition.
 */
export default class DataGenerator {
  /**
   * Generates a random alphanumeric string of the specified length.
   */
  public static randomString(length: number = 8): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * Generates a random integer between min (inclusive) and max (inclusive).
   */
  public static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * Returns a random boolean value.
   */
  public static randomBool(): boolean {
    return Math.random() < 0.5
  }
}
