// src/framework/shared/logger.ts
import pino from "pino"

/** Narrow arbitrary env strings to a valid pino level (fallback to 'info'). */
function toLevel(value?: string): pino.LevelWithSilent {
  switch (value) {
    case "fatal":
    case "error":
    case "warn":
    case "info":
    case "debug":
    case "trace":
    case "silent":
      return value
    default:
      return process.env.DEBUG === "true" ? "debug" : "info"
  }
}

const level = toLevel(process.env.LOG_LEVEL)
const loggerInstance = pino({ level })

export default class Logger {
  private static logger = loggerInstance

  /** Info */
  public static info(
    ...args: Parameters<pino.Logger["info"]>
  ): ReturnType<pino.Logger["info"]> {
    return this.logger.info(...args)
  }

  /** Warn */
  public static warn(
    ...args: Parameters<pino.Logger["warn"]>
  ): ReturnType<pino.Logger["warn"]> {
    return this.logger.warn(...args)
  }

  /** Error (accepts Error | object | message, matches Pino overloads) */
  public static error(
    ...args: Parameters<pino.Logger["error"]>
  ): ReturnType<pino.Logger["error"]> {
    return this.logger.error(...args)
  }

  /** Debug */
  public static debug(
    ...args: Parameters<pino.Logger["debug"]>
  ): ReturnType<pino.Logger["debug"]> {
    return this.logger.debug(...args)
  }
}
