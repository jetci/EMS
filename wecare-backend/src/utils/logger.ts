/**
 * Logger Utility
 * 
 * Environment-driven logging with different levels.
 * In production, only warnings and errors are logged.
 * In development, all logs including debug are shown.
 * 
 * Usage:
 *   import { logger } from './logger';
 *   logger.info('Server started');
 *   logger.debug('Debug info', { data });
 *   logger.warn('Warning message');
 *   logger.error('Error occurred', error);
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

interface LoggerConfig {
    level: LogLevel;
    prefix: string;
    timestamps: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    none: 4
};

class Logger {
    private config: LoggerConfig;

    constructor() {
        const envLevel = (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel;
        const isProd = process.env.NODE_ENV === 'production';

        this.config = {
            level: isProd ? 'warn' : (LOG_LEVELS[envLevel] !== undefined ? envLevel : 'info'),
            prefix: process.env.LOG_PREFIX || '[WeCare]',
            timestamps: process.env.LOG_TIMESTAMPS !== 'false'
        };
    }

    private shouldLog(level: LogLevel): boolean {
        return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
    }

    private formatMessage(level: string, message: string): string {
        const timestamp = this.config.timestamps ? new Date().toISOString() : '';
        const prefix = this.config.prefix;
        return `${timestamp ? `[${timestamp}] ` : ''}${prefix} [${level.toUpperCase()}] ${message}`;
    }

    /**
     * Debug level - only in development
     */
    debug(message: string, ...args: any[]): void {
        if (this.shouldLog('debug')) {
            console.log(this.formatMessage('debug', message), ...args);
        }
    }

    /**
     * Info level - general information
     */
    info(message: string, ...args: any[]): void {
        if (this.shouldLog('info')) {
            console.log(this.formatMessage('info', message), ...args);
        }
    }

    /**
     * Warning level - potential issues
     */
    warn(message: string, ...args: any[]): void {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message), ...args);
        }
    }

    /**
     * Error level - errors and exceptions
     */
    error(message: string, ...args: any[]): void {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message), ...args);
        }
    }

    /**
     * Always log (bypasses level check) - for critical startup messages
     */
    always(message: string, ...args: any[]): void {
        console.log(this.formatMessage('info', message), ...args);
    }

    /**
     * Get current log level
     */
    getLevel(): LogLevel {
        return this.config.level;
    }

    /**
     * Set log level dynamically
     */
    setLevel(level: LogLevel): void {
        if (LOG_LEVELS[level] !== undefined) {
            this.config.level = level;
        }
    }
}

// Export singleton instance
export const logger = new Logger();

// Export the class for testing
export { Logger, LogLevel };
