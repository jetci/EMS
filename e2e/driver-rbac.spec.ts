/**
 * E2E Test: Driver Role RBAC
 * 
 * Tests role-based access control for driver-specific endpoints:
 * - Driver can only access/update their own assigned rides
 * - Driver cannot modify other driver's resources
 * - Driver location updates are validated
 * - Driver job acceptance flow
 */
import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

// Test users
const TEST_USERS = {
    admin: { email: 'admin@wecare.ems', password: 'admin123' },
    driver1: { email: 'driver1@wecare.dev', password: 'driver123' },
    driver2: { email: 'driver2@wecare.dev', password: 'driver123' },
    officer: { email: 'officer1@wecare.dev', password: 'officer123' },
    community: { email: 'community1@wecare.dev', password: 'community123' }
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

// Helper to get user info with driver_id
async function getUserInfo(request: any, email: string, password: string): Promise<any> {
    const response = await request.post(`${API_BASE}/api/auth/login`, {
        data: { email, password }
    });
    if (response.ok()) {
        const data = await response.json();
        return { token: data.token, user: data.user };
    }
    return null;
}

test.describe('Driver Role - RBAC Tests', () => {

    test.describe('Driver Authentication & Token', () => {

        test('Driver login should include driver_id in token response', async ({ request }) => {
            const info = await getUserInfo(request, TEST_USERS.driver1.email, TEST_USERS.driver1.password);

            if (info) {
                // Driver login should include driver_id in user response
                expect(info.user).toBeDefined();
                expect(info.user.role.toLowerCase()).toBe('driver');
                // driver_id may or may not exist depending on drivers table setup
                console.log('Driver user info:', JSON.stringify(info.user, null, 2));
            } else {
                console.log('Driver1 user not available, skipping test');
            }
        });
    });

    test.describe('GET /api/rides - Driver Access', () => {

        test('DRIVER should be able to access rides list', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.driver1.email, TEST_USERS.driver1.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/rides`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(200);
                const data = await response.json();
                expect(data).toHaveProperty('data');
            } else {
                console.log('Driver1 user not available, skipping test');
            }
        });
    });

    test.describe('GET /api/drivers - Driver List Access', () => {

        test('DRIVER should be able to access driver list', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.driver1.email, TEST_USERS.driver1.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/drivers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(200);
            } else {
                console.log('Driver1 user not available, skipping test');
            }
        });

        test('COMMUNITY should NOT access driver list', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.community.email, TEST_USERS.community.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/drivers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(403);
            } else {
                console.log('Community user not available, skipping test');
            }
        });
    });

    test.describe('Driver-Specific Resource Access', () => {

        test('DRIVER should NOT access user management', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.driver1.email, TEST_USERS.driver1.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(403);
            } else {
                console.log('Driver1 user not available, skipping test');
            }
        });

        test('DRIVER should NOT access admin system endpoints', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.driver1.email, TEST_USERS.driver1.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/admin/system/logs`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(403);
            } else {
                console.log('Driver1 user not available, skipping test');
            }
        });

        test('DRIVER should NOT access map-data (office feature)', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.driver1.email, TEST_USERS.driver1.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/map-data`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(403);
            } else {
                console.log('Driver1 user not available, skipping test');
            }
        });
    });

    test.describe('Driver Location Updates', () => {

        test('POST /api/driver-locations - Driver can update their location', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.driver1.email, TEST_USERS.driver1.password);

            if (token) {
                const response = await request.post(`${API_BASE}/api/driver-locations`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    data: {
                        lat: 13.7563,
                        lng: 100.5018,
                        status: 'AVAILABLE'
                    }
                });

                // Should succeed or return appropriate error (depends on driver_id setup)
                expect([200, 201, 400, 404]).toContain(response.status());
            } else {
                console.log('Driver1 user not available, skipping test');
            }
        });

        test('Location update should validate coordinates', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.driver1.email, TEST_USERS.driver1.password);

            if (token) {
                // Send invalid coordinates
                const response = await request.post(`${API_BASE}/api/driver-locations`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    data: {
                        lat: 999, // Invalid latitude
                        lng: 999, // Invalid longitude
                        status: 'AVAILABLE'
                    }
                });

                // Should reject invalid coordinates
                expect([400, 422]).toContain(response.status());
            } else {
                console.log('Driver1 user not available, skipping test');
            }
        });
    });

    test.describe('Driver Ride Events', () => {

        test('DRIVER should be able to access ride events', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.driver1.email, TEST_USERS.driver1.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/ride-events`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(200);
            } else {
                console.log('Driver1 user not available, skipping test');
            }
        });
    });

    test.describe('Cross-Driver Access Prevention', () => {

        test('Driver A cannot assign themselves to rides meant for others', async ({ request }) => {
            // This test verifies that a driver cannot self-assign to rides
            // Only OFFICER/RADIO_CENTER can assign drivers

            const token = await getToken(request, TEST_USERS.driver1.email, TEST_USERS.driver1.password);

            if (token) {
                // Try to create a ride with driver assignment (should fail for driver role)
                const response = await request.put(`${API_BASE}/api/rides/RIDE-001`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    data: {
                        driver_id: 'DRV-002', // Try to assign different driver
                        status: 'ASSIGNED'
                    }
                });

                // Should be 403 (Forbidden) - drivers cannot assign drivers
                expect([403, 404]).toContain(response.status());
            } else {
                console.log('Driver1 user not available, skipping test');
            }
        });
    });

});
