import winston from 'winston';
import path from 'path';

/**
 * Winston Logger Configuration
 * Provides structured logging for development and production
 */

// Log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Log colors for console
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(colors);

// Determine log level based on environment
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : process.env.LOG_LEVEL || 'info';
};

// Custom format for console (development)
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} [${info.level}]: ${info.message}`
    )
);

// Custom format for files (production)
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Filter sensitive data from logs
const sensitiveDataFilter = winston.format((info: any) => {
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization'];

    // Filter message
    if (typeof info.message === 'string') {
        sensitiveKeys.forEach(key => {
            const regex = new RegExp(`"${key}"\\s*:\\s*"[^"]*"`, 'gi');
            info.message = (info.message as string).replace(regex, `"${key}":"[FILTERED]"`);
        });
    }

    // Filter metadata
    if (info.meta && typeof info.meta === 'object') {
        sensitiveKeys.forEach(key => {
            if ((info.meta as any)[key]) {
                (info.meta as any)[key] = '[FILTERED]';
            }
        });
    }

    return info;
});

// Help prevent crashes on serverless environments by only using console transport
const transports: winston.transport[] = [
    new winston.transports.Console({
        format: consoleFormat,
    })
];

// Create logger instance
const logger = winston.createLogger({
    level: level(),
    levels,
    format: winston.format.combine(
        sensitiveDataFilter(),
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat()
    ),
    transports,
    exitOnError: false,
});

// Stream for Morgan HTTP logging
export const stream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

// Helper functions for different log levels
export const logError = (message: string, meta?: any) => {
    logger.error(message, meta);
};

export const logWarn = (message: string, meta?: any) => {
    logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: any) => {
    logger.info(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
    logger.http(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
    logger.debug(message, meta);
};

// Export logger
export default logger;
