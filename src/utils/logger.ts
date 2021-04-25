import * as winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
    winston.format.printf(({level, message, timestamp}) => `${timestamp} [${level}] ${message}`)
  ),
  transports: [new winston.transports.Console()]
});
