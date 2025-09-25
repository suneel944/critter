import pino from 'pino'

import ConfigManager from '../config/ConfigManager'

// Read config up-front
const cfg = ConfigManager.getInstance().getAll() as Record<string, unknown>

// Normalize the debug flag FIRST (avoids TDZ issues)
const debugFlag =
  // eslint-disable-next-line no-restricted-properties
  String(process.env.DEBUG ?? '').toLowerCase() === 'true'

/** Normalize arbitrary input to a valid pino level; fallback uses debugFlag. */
function toLevel(value?: unknown): pino.LevelWithSilent {
  const v = String(value as string).toLowerCase()
  switch (v) {
    case 'fatal':
    case 'error':
    case 'warn':
    case 'info':
    case 'debug':
    case 'trace':
    case 'silent':
      return v as pino.LevelWithSilent
    default:
      return debugFlag ? 'debug' : 'info'
  }
}

// Allow LOG_LEVEL env to override config
// eslint-disable-next-line no-restricted-properties
const level = toLevel(process.env.LOG_LEVEL ?? (cfg['logLevel'] as string | undefined))

const loggerInstance = pino({ level })

export default class Logger {
  private static logger = loggerInstance

  /** Dynamically change log level at runtime (optional helper). */
  public static setLevel(l: pino.LevelWithSilent) {
    this.logger.level = l
  }

  /** Info */
  public static info(...args: Parameters<pino.Logger['info']>): ReturnType<pino.Logger['info']> {
    return this.logger.info(...args)
  }

  /** Warn */
  public static warn(...args: Parameters<pino.Logger['warn']>): ReturnType<pino.Logger['warn']> {
    return this.logger.warn(...args)
  }

  /** Error (accepts Error | object | message, matches Pino overloads) */
  public static error(...args: Parameters<pino.Logger['error']>): ReturnType<pino.Logger['error']> {
    return this.logger.error(...args)
  }

  /** Debug */
  public static debug(...args: Parameters<pino.Logger['debug']>): ReturnType<pino.Logger['debug']> {
    return this.logger.debug(...args)
  }
}
