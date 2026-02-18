/**
 * Integration Tests for Auth API
 * Tests authentication endpoints with actual HTTP requests
 */

import request from 'supertest';
import app from '../../src/index';
import { db } from '../../src/db';
import { initializeSchema, seedData } from '../../src/db/postgresDB';

describe('Auth API Integration Tests', () => {
    const testUser = {
        email: 'test@wecare.test',
        password: 'TestPassword123!',
        name: 'Test User'
    };
    let authToken: string;

    beforeAll(async () => {
        process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/wecare_test';
        await initializeSchema();
        await seedData();
        await db.run('DELETE FROM users WHERE email = $1', [testUser.email]);
    });

    afterAll(async () => {
        await db.run('DELETE FROM users WHERE email = $1', [testUser.email]);
    });

    describe('POST /api/auth/register', () => {
        test('should register new user with valid data', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser)
                .expect(201);

            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(testUser.email);
            expect(response.body.user).not.toHaveProperty('password');
            expect(response.body.token).toBeValidJWT();
        });

        test('should reject registration with weak password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'weak@wecare.test',
                    password: 'weak',
                    name: 'Weak User'
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Password validation failed');
        });

        test('should reject duplicate email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('already registered');
        });

        test('should reject missing email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    password: 'TestPassword123!',
                    name: 'No Email User'
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        test('should reject missing password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'nopwd@wecare.test',
                    name: 'No Password User'
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/auth/login', () => {
        test('should login with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                })
                .expect(200);

            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(testUser.email);
            expect(response.body.token).toBeValidJWT();
            authToken = response.body.token;
        });

        test('should reject login with wrong password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword123!'
                })
                .expect(401);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Invalid credentials');
        });

        test('should reject login with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@wecare.test',
                    password: 'TestPassword123!'
                })
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });

        test('should reject login with missing credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        test('should track failed login attempts', async () => {
            // Make multiple failed attempts
            for (let i = 0; i < 3; i++) {
                await request(app)
                    .post('/api/auth/login')
                    .send({
                        email: testUser.email,
                        password: 'WrongPassword123!'
                    });
            }

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword123!'
                })
                .expect(401);

            expect(response.body).toHaveProperty('remainingAttempts');
            expect(response.body.remainingAttempts).toBeLessThan(5);
        });
    });

    describe('POST /api/auth/change-password', () => {
        test('should change password with valid data', async () => {
            const newPassword = 'NewPassword123!';

            const user = await db.get<any>('SELECT id FROM users WHERE email = $1', [testUser.email]);

            const response = await request(app)
                .post('/api/auth/change-password')
                .send({
                    userId: user!.id,
                    currentPassword: testUser.password,
                    newPassword: newPassword
                })
                .expect(200);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('successfully');

            // Change back to original password for other tests
            await request(app)
                .post('/api/auth/change-password')
                .send({
                    userId: user!.id,
                    currentPassword: newPassword,
                    newPassword: testUser.password
                });
        });

        test('should reject weak new password', async () => {
            const user = await db.get<any>('SELECT id FROM users WHERE email = $1', [testUser.email]);

            const response = await request(app)
                .post('/api/auth/change-password')
                .send({
                    userId: user!.id,
                    currentPassword: testUser.password,
                    newPassword: 'weak'
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Password validation failed');
        });

        test('should reject wrong current password', async () => {
            const user = await db.get<any>('SELECT id FROM users WHERE email = $1', [testUser.email]);

            const response = await request(app)
                .post('/api/auth/change-password')
                .send({
                    userId: user!.id,
                    currentPassword: 'WrongPassword123!',
                    newPassword: 'NewPassword123!'
                })
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/auth/me', () => {
        test('should get current user with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.email).toBe(testUser.email);
            expect(response.body).not.toHaveProperty('password');
        });

        test('should reject request without token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });

        test('should reject request with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });
    });
});
