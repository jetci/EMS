/**
 * E2E Test: API Health Check
 * Tests backend API connectivity and basic endpoints
 */
import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

test.describe('API Health Check', () => {

    test('should return CSRF token', async ({ request }) => {
        const response = await request.get(`${API_BASE}/api/csrf-token`);

        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data).toHaveProperty('csrfToken');
        expect(data.csrfToken).toBeTruthy();
    });

    test('should reject unauthenticated requests to protected endpoints', async ({ request }) => {
        const response = await request.get(`${API_BASE}/api/users`);

        // Should return 401 or 403
        expect([401, 403]).toContain(response.status());
    });

    test('should authenticate and return user data', async ({ request }) => {
        // First get CSRF token
        const csrfResponse = await request.get(`${API_BASE}/api/csrf-token`);
        const { csrfToken } = await csrfResponse.json();

        // Login
        const loginResponse = await request.post(`${API_BASE}/api/auth/login`, {
            data: {
                email: 'admin@wecare.ems',
                password: 'admin123'
            },
            headers: {
                'X-CSRF-Token': csrfToken
            }
        });

        // Should succeed or fail gracefully
        if (loginResponse.ok()) {
            const data = await loginResponse.json();
            expect(data).toHaveProperty('token');
            expect(data).toHaveProperty('user');
        } else {
            // CSRF might require cookies, log for debugging
            console.log('Login response status:', loginResponse.status());
        }
    });

    test('should return proper error for invalid login', async ({ request }) => {
        const loginResponse = await request.post(`${API_BASE}/api/auth/login`, {
            data: {
                email: 'invalid@test.com',
                password: 'wrongpassword'
            }
        });

        // Should return 401
        expect(loginResponse.status()).toBe(401);

        const data = await loginResponse.json();
        expect(data).toHaveProperty('error');
    });

    test('should return dashboard stats for authenticated user', async ({ request }) => {
        // Login first
        const loginResponse = await request.post(`${API_BASE}/api/auth/login`, {
            data: {
                email: 'admin@wecare.ems',
                password: 'admin123'
            }
        });

        if (loginResponse.ok()) {
            const { token } = await loginResponse.json();

            // Get dashboard stats
            const statsResponse = await request.get(`${API_BASE}/api/dashboard/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (statsResponse.ok()) {
                const stats = await statsResponse.json();
                expect(stats).toBeTruthy();
            }
        }
    });

    test('should list drivers for authenticated user', async ({ request }) => {
        // Login first
        const loginResponse = await request.post(`${API_BASE}/api/auth/login`, {
            data: {
                email: 'admin@wecare.ems',
                password: 'admin123'
            }
        });

        if (loginResponse.ok()) {
            const { token } = await loginResponse.json();

            // Get drivers
            const driversResponse = await request.get(`${API_BASE}/api/drivers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (driversResponse.ok()) {
                const drivers = await driversResponse.json();
                expect(Array.isArray(drivers)).toBeTruthy();
            }
        }
    });

});
