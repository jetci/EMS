/**
 * Unit Tests: Logger Utility
 * 
 * Tests the logger functionality including:
 * - Log level filtering
 * - Production vs Development mode
 * - Message formatting
 */

// Save original env
const originalEnv = { ...process.env };

describe('Logger Utility', () => {
    let mockConsoleLog: jest.SpyInstance;
    let mockConsoleWarn: jest.SpyInstance;
    let mockConsoleError: jest.SpyInstance;

    beforeEach(() => {
        // Reset environment
        process.env = { ...originalEnv };
        // Reset modules to pick up new env
        jest.resetModules();
        // Set up mocks fresh for each test
        mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
        mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
        mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        // Restore mocks
        mockConsoleLog.mockRestore();
        mockConsoleWarn.mockRestore();
        mockConsoleError.mockRestore();
    });

    afterAll(() => {
        // Restore original env
        process.env = originalEnv;
    });

    describe('Log Level Filtering', () => {

        test('should log all levels when LOG_LEVEL=debug', () => {
            process.env.LOG_LEVEL = 'debug';
            process.env.NODE_ENV = 'development';
            process.env.LOG_TIMESTAMPS = 'false';

            const { Logger } = require('../../wecare-backend/src/utils/logger');
            const logger = new Logger();

            logger.debug('Debug message');
            logger.info('Info message');
            logger.warn('Warn message');
            logger.error('Error message');

            expect(mockConsoleLog).toHaveBeenCalledTimes(2); // debug + info
            expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
            expect(mockConsoleError).toHaveBeenCalledTimes(1);
        });

        test('should only log warn and error in production', () => {
            process.env.NODE_ENV = 'production';
            process.env.LOG_TIMESTAMPS = 'false';

            const { Logger } = require('../../wecare-backend/src/utils/logger');
            const logger = new Logger();

            logger.debug('Debug message');
            logger.info('Info message');
            logger.warn('Warn message');
            logger.error('Error message');

            expect(mockConsoleLog).toHaveBeenCalledTimes(0); // debug + info suppressed
            expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
            expect(mockConsoleError).toHaveBeenCalledTimes(1);
        });

        test('should respect LOG_LEVEL=error (only errors)', () => {
            process.env.LOG_LEVEL = 'error';
            process.env.NODE_ENV = 'development';
            process.env.LOG_TIMESTAMPS = 'false';

            const { Logger } = require('../../wecare-backend/src/utils/logger');
            const logger = new Logger();

            logger.debug('Debug message');
            logger.info('Info message');
            logger.warn('Warn message');
            logger.error('Error message');

            expect(mockConsoleLog).toHaveBeenCalledTimes(0);
            expect(mockConsoleWarn).toHaveBeenCalledTimes(0);
            expect(mockConsoleError).toHaveBeenCalledTimes(1);
        });
    });

    describe('Dynamic Level Change', () => {

        test('should allow changing log level dynamically', () => {
            process.env.LOG_LEVEL = 'info';
            process.env.NODE_ENV = 'development';
            process.env.LOG_TIMESTAMPS = 'false';

            const { Logger } = require('../../wecare-backend/src/utils/logger');
            const logger = new Logger();

            // Initially at info level
            expect(logger.getLevel()).toBe('info');

            // Change to debug
            logger.setLevel('debug');
            expect(logger.getLevel()).toBe('debug');

            // Change to error
            logger.setLevel('error');
            expect(logger.getLevel()).toBe('error');
        });

        test('should ignore invalid log levels', () => {
            process.env.LOG_LEVEL = 'info';
            process.env.NODE_ENV = 'development';

            const { Logger } = require('../../wecare-backend/src/utils/logger');
            const logger = new Logger();

            const originalLevel = logger.getLevel();
            logger.setLevel('invalid_level' as any);
            expect(logger.getLevel()).toBe(originalLevel);
        });
    });

    describe('Always Log', () => {

        test('should always log regardless of level', () => {
            process.env.LOG_LEVEL = 'error';  // High level
            process.env.NODE_ENV = 'development';
            process.env.LOG_TIMESTAMPS = 'false';

            const { Logger } = require('../../wecare-backend/src/utils/logger');
            const logger = new Logger();

            // Regular logs should be suppressed
            logger.debug('Debug');
            logger.info('Info');

            // Always should still work
            logger.always('Critical startup message');

            // Only 'always' should have logged
            expect(mockConsoleLog).toHaveBeenCalledTimes(1);
        });
    });

    describe('Message Formatting', () => {

        test('should include prefix in messages', () => {
            process.env.LOG_LEVEL = 'info';
            process.env.NODE_ENV = 'development';
            process.env.LOG_TIMESTAMPS = 'false';
            process.env.LOG_PREFIX = '[TestApp]';

            const { Logger } = require('../../wecare-backend/src/utils/logger');
            const logger = new Logger();

            logger.info('Test message');

            expect(mockConsoleLog).toHaveBeenCalledWith(
                expect.stringContaining('[TestApp]')
            );
            expect(mockConsoleLog).toHaveBeenCalledWith(
                expect.stringContaining('[INFO]')
            );
        });
    });

});
