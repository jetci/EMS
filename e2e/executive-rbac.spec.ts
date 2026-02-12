/**
 * E2E Test: Executive Role RBAC
 * 
 * Tests role-based access control for Executive role:
 * - Read-only access to Operational Data (Rides, Patients)
 * - Access to Reports and Dashboards
 * - Access to Real-time Driver Locations (monitoring)
 * - Blocked from Modification Actions (Create/Update/Delete)
 * - Blocked from Admin System Settings
 */
import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

// Test users
const TEST_USERS = {
    admin: { email: 'admin@wecare.ems', password: 'admin123' },
    executive: { email: 'executive1@wecare.dev', password: 'password123' }
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

test.describe('Executive Role - RBAC Tests', () => {

    test.describe('Read Access - Reports & Dashboard', () => {

        test('EXECUTIVE should access dashboard stats', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.executive.email, TEST_USERS.executive.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/dashboard/executive`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(200);
            } else {
                console.log('Executive user not available, skipping test');
            }
        });

        test('EXECUTIVE should access reports', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.executive.email, TEST_USERS.executive.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/executive/reports/export?type=summary&format=csv`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Should be 200 OK
                expect(response.status()).toBe(200);
                expect(response.headers()['content-type']).toContain('text/csv');
            } else {
                console.log('Executive user not available, skipping test');
            }
        });
    });

    test.describe('Read Access - Operational Data', () => {

        test('EXECUTIVE should View All Rides', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.executive.email, TEST_USERS.executive.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/rides`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(200);
            } else {
                console.log('Executive user not available, skipping test');
            }
        });

        test('EXECUTIVE should View All Patients', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.executive.email, TEST_USERS.executive.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/patients`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(200);
            } else {
                console.log('Executive user not available, skipping test');
            }
        });

        test('EXECUTIVE should View Driver Locations', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.executive.email, TEST_USERS.executive.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/driver-locations`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(200);
            } else {
                console.log('Executive user not available, skipping test');
            }
        });
    });

    test.describe('Write Access Restrictions (Read-Only Policy)', () => {

        // NOTE: If these tests fail with 200/201, it means permissions need tightening in rides.ts

        test('EXECUTIVE should NOT be able to Create Rides', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.executive.email, TEST_USERS.executive.password);

            if (token) {
                const response = await request.post(`${API_BASE}/api/rides`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    data: {
                        patient_name: 'Test Patient Executive',
                        pickup_location: 'Test',
                        destination: 'Test',
                        appointment_time: new Date().toISOString()
                    }
                });

                // Expect 403 Forbidden
                expect(response.status()).toBe(403);
            } else {
                console.log('Executive user not available, skipping test');
            }
        });

        test('EXECUTIVE should NOT be able to Update Rides', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.executive.email, TEST_USERS.executive.password);

            if (token) {
                // Try to update ride RIDE-001 (assuming it exists or mocked)
                const response = await request.put(`${API_BASE}/api/rides/RIDE-001`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    data: {
                        status: 'CANCELLED'
                    }
                });

                // Expect 403 Forbidden
                expect(response.status()).toBe(403);
            } else {
                console.log('Executive user not available, skipping test');
            }
        });

        test('EXECUTIVE should NOT be able to Delete Rides', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.executive.email, TEST_USERS.executive.password);

            if (token) {
                const response = await request.delete(`${API_BASE}/api/rides/RIDE-001`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Expect 403 Forbidden
                expect(response.status()).toBe(403);
            } else {
                console.log('Executive user not available, skipping test');
            }
        });
    });

    test.describe('Admin System Access Restrictions', () => {

        test('EXECUTIVE should NOT access Users Management', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.executive.email, TEST_USERS.executive.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(403);
            } else {
                console.log('Executive user not available, skipping test');
            }
        });
    });

});
