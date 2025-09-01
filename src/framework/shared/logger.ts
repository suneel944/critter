import pino from 'pino';

/**
 * Logger wraps a pino instance to provide simple static logging methods.
 *
 * The log level can be controlled via the `LOG_LEVEL` environment variable
 * (e.g. "info", "warn", "error", "debug").  If `LOG_LEVEL` is not set,
 * the logger will use `debug` when `DEBUG=true`, otherwise `info`.
 *
 * Pino outputs logs in JSON by default which makes it easy to process in
 * CI/CD pipelines.  To pretty‑print logs during local development, you can
 * pipe the output through the `pino-pretty` CLI or set up a transport in
 * your application entrypoint.  We avoid a hard dependency on `pino-pretty`
 * here to keep the framework lean and because the test runner typically
 * controls log formatting.
 */
const level =
  process.env.LOG_LEVEL || (process.env.DEBUG === 'true' ? 'debug' : 'info');

const loggerInstance = pino({ level });

export default class Logger {
  private static logger = loggerInstance;

  /**
   * Log an informational message.  Accepts a message string and optional
   * additional arguments which will be passed through to pino.  Objects will
   * be serialized into the log output.
   */
  public static info(message: any, ...args: any[]): void {
    this.logger.info(message, ...args);
  }

  /**
   * Log a warning message.
   */
  public static warn(message: any, ...args: any[]): void {
    this.logger.warn(message, ...args);
  }

  /**
   * Log an error.  Accepts any arguments supported by pino’s error method.
   * You can pass an Error object as the first argument, followed by a
   * message string and optional additional parameters.  pino will attach
   * stack traces automatically when an Error is logged.
   */
  public static error(...args: any[]): void {
    // Forward all arguments directly to the underlying logger.  This
    // signature avoids TypeScript complaining about spread parameters not
    // matching tuple expectations in pino’s overloaded definitions.
    (this.logger as any).error(...args);
  }

  /**
   * Log a debug message.  Debug messages are only emitted when the log level
   * is set to `debug`.
   */
  public static debug(message: any, ...args: any[]): void {
    this.logger.debug(message, ...args);
  }
}