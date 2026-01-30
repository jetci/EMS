/**
 * Winston Logger Configuration
 * Centralized logging for production monitoring
 */

import winston from 'winston';
import path from 'path';

const LOG_DIR = process.env.LOG_DIR || './logs';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'wecare-backend' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Access log file
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'access.log'),
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Stream for Morgan (HTTP logging)
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper functions
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error, meta?: any) => {
  logger.error(message, { error: error?.message, stack: error?.stack, ...meta });
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta);
};

// Log uncaught exceptions
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(LOG_DIR, 'exceptions.log'),
  })
);

// Log unhandled promise rejections
logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(LOG_DIR, 'rejections.log'),
  })
);

console.log('✅ Logger initialized');
