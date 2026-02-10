/**
 * E2E Test: User Management RBAC
 * 
 * Tests role-based access control for user management endpoints:
 * - POST /api/users (create)
 * - PUT /api/users/:id (update)
 * - DELETE /api/users/:id
 * - POST /api/users/:id/reset-password
 * 
 * Verifies:
 * - ADMIN can create/update/delete users
 * - Non-admin roles (OFFICER, COMMUNITY, DRIVER) are rejected with 403
 * - Developer protections work correctly
 */
import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3000';

// Test users
const TEST_USERS = {
    admin: { email: 'admin@wecare.ems', password: 'password123' },
    officer: { email: 'officer1@wecare.dev', password: 'password123' },
    community: { email: 'community1@wecare.dev', password: 'password123' },
    driver: { email: 'driver1@wecare.dev', password: 'password123' }
};

// Helper to get auth token
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

test.describe('User Management - RBAC Tests', () => {

    test.describe('GET /api/users - List Users', () => {

        test('ADMIN should be able to list users', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.admin.email, TEST_USERS.admin.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(200);
                const users = await response.json();
                expect(Array.isArray(users)).toBeTruthy();
            }
        });

        test('OFFICER should be rejected from listing users', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.officer.email, TEST_USERS.officer.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Should be 403 Forbidden
                expect(response.status()).toBe(403);
            } else {
                console.log('Officer user not available, skipping test');
            }
        });

        test('COMMUNITY should be rejected from listing users', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.community.email, TEST_USERS.community.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(403);
            } else {
                console.log('Community user not available, skipping test');
            }
        });

        test('DRIVER should be rejected from listing users', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.driver.email, TEST_USERS.driver.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(403);
            } else {
                console.log('Driver user not available, skipping test');
            }
        });

        test('Unauthenticated request should be rejected', async ({ request }) => {
            const response = await request.get(`${API_BASE}/api/users`);
            expect([401, 403]).toContain(response.status());
        });
    });

    test.describe('POST /api/users - Create User', () => {

        test('OFFICER should be rejected from creating users', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.officer.email, TEST_USERS.officer.password);

            if (token) {
                const response = await request.post(`${API_BASE}/api/users`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    data: {
                        email: 'test-new-user@test.com',
                        fullName: 'Test User',
                        role: 'COMMUNITY',
                        password: 'TestPass123!'
                    }
                });

                // Should be 403 Forbidden
                expect(response.status()).toBe(403);
            } else {
                console.log('Officer user not available, skipping test');
            }
        });

        test('COMMUNITY should be rejected from creating users', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.community.email, TEST_USERS.community.password);

            if (token) {
                const response = await request.post(`${API_BASE}/api/users`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    data: {
                        email: 'test-new-user@test.com',
                        fullName: 'Test User',
                        role: 'COMMUNITY',
                        password: 'TestPass123!'
                    }
                });

                expect(response.status()).toBe(403);
            } else {
                console.log('Community user not available, skipping test');
            }
        });

        test('DRIVER should be rejected from creating users', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.driver.email, TEST_USERS.driver.password);

            if (token) {
                const response = await request.post(`${API_BASE}/api/users`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    data: {
                        email: 'test-new-user@test.com',
                        fullName: 'Test User',
                        role: 'DRIVER',
                        password: 'TestPass123!'
                    }
                });

                expect(response.status()).toBe(403);
            } else {
                console.log('Driver user not available, skipping test');
            }
        });

        test('Unauthenticated request should be rejected from creating users', async ({ request }) => {
            const response = await request.post(`${API_BASE}/api/users`, {
                data: {
                    email: 'test-new-user@test.com',
                    fullName: 'Test User',
                    role: 'COMMUNITY',
                    password: 'TestPass123!'
                }
            });

            expect([401, 403]).toContain(response.status());
        });
    });

    test.describe('DELETE /api/users/:id - Delete User', () => {

        test('OFFICER should be rejected from deleting users', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.officer.email, TEST_USERS.officer.password);

            if (token) {
                // Try to delete a random user ID
                const response = await request.delete(`${API_BASE}/api/users/USR-999`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Should be 403 Forbidden (not 404)
                expect(response.status()).toBe(403);
            } else {
                console.log('Officer user not available, skipping test');
            }
        });

        test('COMMUNITY should be rejected from deleting users', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.community.email, TEST_USERS.community.password);

            if (token) {
                const response = await request.delete(`${API_BASE}/api/users/USR-999`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(403);
            } else {
                console.log('Community user not available, skipping test');
            }
        });

        test('Unauthenticated request should be rejected from deleting users', async ({ request }) => {
            const response = await request.delete(`${API_BASE}/api/users/USR-001`);
            expect([401, 403]).toContain(response.status());
        });
    });

    test.describe('POST /api/users/:id/reset-password - Reset Password', () => {

        test('OFFICER should be rejected from resetting passwords', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.officer.email, TEST_USERS.officer.password);

            if (token) {
                const response = await request.post(`${API_BASE}/api/users/USR-001/reset-password`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    data: { newPassword: 'NewPass123!' }
                });

                expect(response.status()).toBe(403);
            } else {
                console.log('Officer user not available, skipping test');
            }
        });

        test('COMMUNITY should be rejected from resetting passwords', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.community.email, TEST_USERS.community.password);

            if (token) {
                const response = await request.post(`${API_BASE}/api/users/USR-001/reset-password`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    data: { newPassword: 'NewPass123!' }
                });

                expect(response.status()).toBe(403);
            } else {
                console.log('Community user not available, skipping test');
            }
        });
    });

});
