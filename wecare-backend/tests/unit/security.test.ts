/**
 * Security Configuration Tests
 * Tests for JWT secrets, environment variables, and security settings
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

describe('Security Configuration Tests', () => {
    describe('Environment Variables', () => {
        test('JWT_SECRET should be set', () => {
            expect(process.env.JWT_SECRET).toBeDefined();
            expect(process.env.JWT_SECRET).not.toBe('');
        });

        test('JWT_SECRET should not be default value', () => {
            const defaultSecret = 'your-super-secret-jwt-key-change-this-in-production';
            expect(process.env.JWT_SECRET).not.toBe(defaultSecret);
        });

        test('JWT_SECRET should be strong (at least 32 characters)', () => {
            const secret = process.env.JWT_SECRET || '';
            expect(secret.length).toBeGreaterThanOrEqual(32);
        });

        test('SESSION_SECRET should be set', () => {
            expect(process.env.SESSION_SECRET).toBeDefined();
            expect(process.env.SESSION_SECRET).not.toBe('');
        });

        test('SESSION_SECRET should not be default value', () => {
            const defaultSecret = 'your-session-secret-change-this';
            expect(process.env.SESSION_SECRET).not.toBe(defaultSecret);
        });

        test('SESSION_SECRET should be strong (at least 32 characters)', () => {
            const secret = process.env.SESSION_SECRET || '';
            expect(secret.length).toBeGreaterThanOrEqual(32);
        });
    });

    describe('Database Configuration', () => {
        test('DATABASE_MODE should be set', () => {
            expect(process.env.DATABASE_MODE).toBeDefined();
        });

        test('DATABASE_MODE should be sqlite or postgresql', () => {
            const mode = process.env.DATABASE_MODE;
            expect(['sqlite', 'postgresql']).toContain(mode);
        });

        test('DATABASE_PATH should be set when using SQLite', () => {
            if (process.env.DATABASE_MODE === 'sqlite') {
                expect(process.env.DATABASE_PATH).toBeDefined();
                expect(process.env.DATABASE_PATH).not.toBe('');
            }
        });
    });

    describe('CORS Configuration', () => {
        test('ALLOWED_ORIGINS should be set in production', () => {
            if (process.env.NODE_ENV === 'production') {
                expect(process.env.ALLOWED_ORIGINS).toBeDefined();
                expect(process.env.ALLOWED_ORIGINS).not.toBe('');
            }
        });

        test('ALLOWED_ORIGINS should not contain localhost in production', () => {
            if (process.env.NODE_ENV === 'production' && process.env.ALLOWED_ORIGINS) {
                expect(process.env.ALLOWED_ORIGINS.toLowerCase()).not.toContain('localhost');
                expect(process.env.ALLOWED_ORIGINS.toLowerCase()).not.toContain('127.0.0.1');
            }
        });

        test('ALLOWED_ORIGINS should use HTTPS in production', () => {
            if (process.env.NODE_ENV === 'production' && process.env.ALLOWED_ORIGINS) {
                const origins = process.env.ALLOWED_ORIGINS.split(',');
                origins.forEach(origin => {
                    expect(origin.trim()).toMatch(/^https:\/\//);
                });
            }
        });
    });

    describe('Security Settings', () => {
        test('CSRF_COOKIE_SECURE should be true in production', () => {
            if (process.env.NODE_ENV === 'production') {
                expect(process.env.CSRF_COOKIE_SECURE).toBe('true');
            }
        });

        test('LOG_LEVEL should be warn or error in production', () => {
            if (process.env.NODE_ENV === 'production') {
                const logLevel = process.env.LOG_LEVEL || 'info';
                expect(['warn', 'error']).toContain(logLevel);
            }
        });
    });

    describe('Port Configuration', () => {
        test('PORT should be set', () => {
            expect(process.env.PORT).toBeDefined();
        });

        test('PORT should be a valid number', () => {
            const port = Number(process.env.PORT);
            expect(port).toBeGreaterThan(0);
            expect(port).toBeLessThan(65536);
        });
    });
});

describe('JWT Token Tests', () => {
    let jwt: any;

    beforeAll(() => {
        jwt = require('jsonwebtoken');
    });

    test('Should be able to sign JWT with current secret', () => {
        const payload = { userId: 'test-123', email: 'test@example.com', role: 'admin' };

        expect(() => {
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        }).not.toThrow();
    });

    test('Should be able to verify JWT with current secret', () => {
        const payload = { userId: 'test-123', email: 'test@example.com', role: 'admin' };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        expect(() => {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            expect(decoded).toHaveProperty('userId', 'test-123');
            expect(decoded).toHaveProperty('email', 'test@example.com');
            expect(decoded).toHaveProperty('role', 'admin');
        }).not.toThrow();
    });

    test('Should reject JWT with wrong secret', () => {
        const payload = { userId: 'test-123', email: 'test@example.com', role: 'admin' };
        const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });

        expect(() => {
            jwt.verify(token, process.env.JWT_SECRET);
        }).toThrow();
    });
});

describe('Password Hashing Tests', () => {
    let bcrypt: any;

    beforeAll(() => {
        bcrypt = require('bcryptjs');
    });

    test('Should hash passwords correctly', async () => {
        const password = 'TestPassword123!';
        const hash = await bcrypt.hash(password, 5);

        expect(hash).toBeDefined();
        expect(hash).not.toBe(password);
        expect(hash.length).toBeGreaterThan(0);
    });

    test('Should verify correct password', async () => {
        const password = 'TestPassword123!';
        const hash = await bcrypt.hash(password, 5);
        const isMatch = await bcrypt.compare(password, hash);

        expect(isMatch).toBe(true);
    });

    test('Should reject incorrect password', async () => {
        const password = 'TestPassword123!';
        const wrongPassword = 'WrongPassword123!';
        const hash = await bcrypt.hash(password, 5);
        const isMatch = await bcrypt.compare(wrongPassword, hash);

        expect(isMatch).toBe(false);
    });
});
