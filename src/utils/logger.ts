import * as winston from 'winston';

/**
 * A class for writing logs.
 */
export class Logger {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = Logger.createLogger();
  }

  /**
   * Write a debug log.
   *
   * @param logMessage The log message.
   * @param keyValuePairs Additional key/value pairs to log.
   */
  public debug(logMessage: string, keyValuePairs?: Readonly<{[key: string]: string}>): void {
    Logger.writeLog(this.logger.debug, logMessage, keyValuePairs);
  }

  /**
   * Write an info log.
   *
   * @param logMessage The log message.
   * @param keyValuePairs Additional key/value pairs to log.
   */
  public info(logMessage: string, keyValuePairs?: Readonly<{[key: string]: string}>): void {
    Logger.writeLog(this.logger.info, logMessage, keyValuePairs);
  }

  /**
   * Write a warn log.
   *
   * @param logMessage The log message.
   * @param keyValuePairs Additional key/value pairs to log.
   */
  public warn(logMessage: string, keyValuePairs?: Readonly<{[key: string]: string}>): void {
    Logger.writeLog(this.logger.warn, logMessage, keyValuePairs);
  }

  /**
   * Write an error log.
   *
   * @param logMessage The log message.
   * @param error An error to log.
   * @param keyValuePairs Additional key/value pairs to log.
   */
  public error(logMessage: string, error?: Error, keyValuePairs?: Readonly<{[key: string]: string}>): void {
    Logger.writeLog(this.logger.error, logMessage, keyValuePairs, error);
  }

  /**
   * Create a Winston logger.
   *
   * @return A Winston logger.
   */
  private static createLogger(): winston.Logger {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
        winston.format.printf(info => {
          let padding = '';
          for (let i = 0; i < (5 - info.level.length); i++) {
            padding += ' ';
          }
          let log = `${info.timestamp} [${info.level}]${padding} ${info.message}`;
          if (info.error) {
            log += `\n${info.error.stack}`;
          }
          return log;
        })
      ),
      transports: [new winston.transports.Console()]
    });
  }

  /**
   * Write a log with the given information using the given Winston log method.
   *
   * @param winstonLogMethod The Winston log method to use.
   * @param logMessage The log message.
   * @param keyValuePairs Additional key/value pairs to log.
   * @param error An error to log.
   */
  private static writeLog(winstonLogMethod: (infoObject: Record<string, unknown>) => winston.Logger,
    logMessage: string, keyValuePairs?: Readonly<{[key: string]: string}>, error?: Readonly<Error>): void {

    let message = `message="${logMessage}"`;
    if (keyValuePairs) {
      for (const key of Object.getOwnPropertyNames(keyValuePairs)) {
        message += `, ${key}="${keyValuePairs[key]}"`;
      }
    }

    winstonLogMethod({
      message,
      error
    });
  }
}
