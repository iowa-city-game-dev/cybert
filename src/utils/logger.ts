import * as winston from 'winston';

export const logger = winston.createLogger({
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
