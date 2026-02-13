// Test setup file
// Runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.PORT = '3002'; // Different port for testing
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    // Keep error for debugging
    error: console.error,
};

// Add custom matchers if needed
expect.extend({
    toBeValidJWT(received: string) {
        const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
        const pass = jwtRegex.test(received);

        return {
            pass,
            message: () => pass
                ? `expected ${received} not to be a valid JWT`
                : `expected ${received} to be a valid JWT`
        };
    }
});

// Extend Jest matchers type
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValidJWT(): R;
        }
    }
}

import { initializeDatabase } from '../src/db/sqliteDB';

beforeAll(async () => {
    // Silence logs during test initialization
    const originalLog = console.log;
    console.log = jest.fn();
    try {
        await initializeDatabase();
    } finally {
        console.log = originalLog;
    }
});

export { };
