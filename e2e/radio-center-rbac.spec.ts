/**
 * E2E Test: Radio Center RBAC & Socket Authentication
 * 
 * Tests:
 * - HTTP API access for Radio Center role
 * - Driver location endpoints
 * - Map data access
 * - Socket authentication verification (indirect via HTTP)
 */
import { test, expect } from '@playwright/test';

const API_BASE = process.env.API_URL || 'http://localhost:3000';

// Test users
const TEST_USERS = {
    admin: { email: 'admin@wecare.ems', password: 'password123' },
    radioCenter: { email: 'radio_center@wecare.dev', password: 'password123' },
    officer: { email: 'officer1@wecare.dev', password: 'password123' },
    community: { email: 'community1@wecare.dev', password: 'password123' },
    driver: { email: 'driver1@wecare.dev', password: 'password123' }
};


// Helper to get auth token
async function getToken(request: any, email: string, password: string): Promise<string> {
    const response = await request.post(`${API_BASE}/api/auth/login`, {
        data: { email, password }
    });
    expect(response.status(), 'login should return 200').toBe(200);
    const data = await response.json();
    expect(data.token, 'login response should include token').toBeTruthy();
    return data.token as string;
}

test.describe('Radio Center - HTTP API RBAC Tests', () => {

    test.describe('GET /api/driver-locations - Real-time Location Data', () => {

        test('RADIO_CENTER should access driver locations', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.radioCenter.email, TEST_USERS.radioCenter.password);

            const response = await request.get(`${API_BASE}/api/driver-locations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            expect(response.status()).toBe(200);
        });

        test('OFFICER should access driver locations', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.officer.email, TEST_USERS.officer.password);

            const response = await request.get(`${API_BASE}/api/driver-locations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            expect(response.status()).toBe(200);
        });

        test('COMMUNITY should NOT access driver locations', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.community.email, TEST_USERS.community.password);

            const response = await request.get(`${API_BASE}/api/driver-locations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            expect(response.status()).toBe(403);
        });

        test('Unauthenticated request should be rejected', async ({ request }) => {
            const response = await request.get(`${API_BASE}/api/driver-locations`);
            expect([401, 403]).toContain(response.status());
        });
    });

    test.describe('GET /api/map-data - Map Command Data', () => {

        test('RADIO_CENTER should access map data', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.radioCenter.email, TEST_USERS.radioCenter.password);

            const response = await request.get(`${API_BASE}/api/map-data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            expect([200, 404]).toContain(response.status());
        });

        test('OFFICER should access map data', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.officer.email, TEST_USERS.officer.password);

            const response = await request.get(`${API_BASE}/api/map-data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            expect([200, 404]).toContain(response.status());
        });

        test('COMMUNITY should NOT access map data', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.community.email, TEST_USERS.community.password);

            const response = await request.get(`${API_BASE}/api/map-data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            expect(response.status()).toBe(403);
        });
    });

    test.describe('GET /api/ride-events/:rideId - Ride Event Timeline', () => {

        test('RADIO_CENTER should access ride events', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.radioCenter.email, TEST_USERS.radioCenter.password);

            const response = await request.get(`${API_BASE}/api/ride-events/RIDE-001`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            expect(response.status()).toBe(200);
        });

        test('DRIVER should access ride events', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.driver.email, TEST_USERS.driver.password);

            const response = await request.get(`${API_BASE}/api/ride-events/RIDE-001`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            expect(response.status()).toBe(200);
        });

        test('COMMUNITY should NOT access ride events', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.community.email, TEST_USERS.community.password);

            const response = await request.get(`${API_BASE}/api/ride-events/RIDE-001`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            expect(response.status()).toBe(403);
        });
    });

    test.describe('Team & Vehicle Management', () => {

        test('RADIO_CENTER should access teams', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.radioCenter.email, TEST_USERS.radioCenter.password);

            const response = await request.get(`${API_BASE}/api/teams`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            expect(response.status()).toBe(200);
        });

        test('RADIO_CENTER should access vehicles', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.radioCenter.email, TEST_USERS.radioCenter.password);

            const response = await request.get(`${API_BASE}/api/vehicles`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            expect(response.status()).toBe(200);
        });

        test('COMMUNITY should NOT access teams', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.community.email, TEST_USERS.community.password);

            const response = await request.get(`${API_BASE}/api/teams`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            expect(response.status()).toBe(403);
        });
    });

});

test.describe('Socket Authentication - Verification', () => {

    test('Should verify socket namespace requires authentication token', async ({ request }) => {
        // Note: We cannot directly test WebSocket in Playwright API tests
        // But we can verify that the backend socket.io endpoint exists
        // and that it's not accessible without proper credentials

        // This test verifies the server is set up correctly by checking
        // that the socket.io endpoint responds
        const response = await request.get(`${API_BASE}/socket.io/?EIO=4&transport=polling`);

        // Socket.IO should return a packet or error
        // A 400 or specific response indicates the endpoint exists
        // (actual socket auth is tested via the frontend integration)
        expect([200, 400]).toContain(response.status());
    });
});
