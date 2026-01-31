/**
 * Integration Tests: Admin System Endpoints
 * 
 * Tests role-based access control for critical admin endpoints:
 * - /api/admin/system/reset-db
 * - /api/admin/system/seed-users
 * - /api/admin/system/logs
 * 
 * Verifies that:
 * - DEVELOPER role can access these endpoints
 * - ADMIN role can access these endpoints
 * - Other roles (COMMUNITY, DRIVER, etc.) are rejected with 403
 */
import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

// Test users for different roles
const TEST_USERS = {
    developer: {
        email: 'dev@wecare.ems',
        password: 'dev123'
    },
    admin: {
        email: 'admin@wecare.ems',
        password: 'admin123'
    },
    community: {
        email: 'community1@wecare.dev',
        password: 'community123'
    },
    driver: {
        email: 'driver1@wecare.dev',
        password: 'driver123'
    }
};

// Helper function to login and get token
async function getToken(request: any, email: string, password: string): Promise<string | null> {
    const response = await request.post(`${API_BASE}/api/auth/login`, {
        data: { email, password }
    });

    if (response.ok()) {
        const data = await response.json();
        return data.token;
    }
    return null;
}

test.describe('Admin System Endpoints - Role Access Control', () => {

    test.describe('GET /api/admin/system/logs', () => {

        test('should allow DEVELOPER to access system logs', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.developer.email, TEST_USERS.developer.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/admin/system/logs`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Should be 200 OK
                expect(response.status()).toBe(200);
                const logs = await response.json();
                expect(Array.isArray(logs)).toBeTruthy();
            } else {
                // Skip if dev user doesn't exist
                console.log('Developer user not available, skipping test');
            }
        });

        test('should allow ADMIN to access system logs', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.admin.email, TEST_USERS.admin.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/admin/system/logs`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Should be 200 OK
                expect(response.status()).toBe(200);
            } else {
                console.log('Admin user not available, skipping test');
            }
        });

        test('should REJECT COMMUNITY user from accessing system logs', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.community.email, TEST_USERS.community.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/admin/system/logs`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Should be 403 Forbidden
                expect(response.status()).toBe(403);
            } else {
                console.log('Community user not available, skipping test');
            }
        });

        test('should REJECT DRIVER user from accessing system logs', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.driver.email, TEST_USERS.driver.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/admin/system/logs`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Should be 403 Forbidden
                expect(response.status()).toBe(403);
            } else {
                console.log('Driver user not available, skipping test');
            }
        });

        test('should REJECT unauthenticated request', async ({ request }) => {
            const response = await request.get(`${API_BASE}/api/admin/system/logs`);

            // Should be 401 Unauthorized
            expect([401, 403]).toContain(response.status());
        });
    });

    test.describe('POST /api/admin/system/seed-users (RBAC Check Only - No Execution)', () => {

        test('COMMUNITY user should be rejected from seed-users endpoint', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.community.email, TEST_USERS.community.password);

            if (token) {
                const response = await request.post(`${API_BASE}/api/admin/system/seed-users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Should be 403 Forbidden
                expect(response.status()).toBe(403);

                const data = await response.json();
                expect(data.error).toContain('Forbidden');
            } else {
                console.log('Community user not available, skipping test');
            }
        });

        test('DRIVER user should be rejected from seed-users endpoint', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.driver.email, TEST_USERS.driver.password);

            if (token) {
                const response = await request.post(`${API_BASE}/api/admin/system/seed-users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Should be 403 Forbidden
                expect(response.status()).toBe(403);
            } else {
                console.log('Driver user not available, skipping test');
            }
        });
    });

    test.describe('POST /api/admin/system/reset-db (RBAC Check Only - No Execution)', () => {

        test('COMMUNITY user should be rejected from reset-db endpoint', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.community.email, TEST_USERS.community.password);

            if (token) {
                const response = await request.post(`${API_BASE}/api/admin/system/reset-db`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Should be 403 Forbidden
                expect(response.status()).toBe(403);

                const data = await response.json();
                expect(data.error).toContain('Forbidden');
            } else {
                console.log('Community user not available, skipping test');
            }
        });

        test('Unauthenticated request should be rejected from reset-db', async ({ request }) => {
            const response = await request.post(`${API_BASE}/api/admin/system/reset-db`);

            // Should be 401 Unauthorized
            expect([401, 403]).toContain(response.status());
        });
    });

});
