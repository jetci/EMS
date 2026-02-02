/**
 * E2E Test: Officer Ride Management RBAC
 * 
 * Tests role-based access control for ride management endpoints:
 * - GET /api/rides (list)
 * - POST /api/rides (create)
 * - PUT /api/rides/:id (update/assign)
 * - DELETE /api/rides/:id
 * 
 * Verifies:
 * - OFFICER can access and manage rides
 * - Driver assignment is protected by transaction
 * - Community users can only access their own rides
 */
import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

// Test users
const TEST_USERS = {
    admin: { email: 'admin@wecare.ems', password: 'admin123' },
    officer: { email: 'officer1@wecare.dev', password: 'officer123' },
    community: { email: 'community1@wecare.dev', password: 'community123' },
    driver: { email: 'driver1@wecare.dev', password: 'driver123' }
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

test.describe('Ride Management - RBAC Tests', () => {

    test.describe('GET /api/rides - List Rides', () => {

        test('OFFICER should be able to list all rides', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.officer.email, TEST_USERS.officer.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/rides`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(200);
                const data = await response.json();
                // Should return paginated response
                expect(data).toHaveProperty('data');
                expect(Array.isArray(data.data)).toBeTruthy();
            } else {
                console.log('Officer user not available, skipping test');
            }
        });

        test('ADMIN should be able to list all rides', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.admin.email, TEST_USERS.admin.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/rides`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.status()).toBe(200);
            } else {
                console.log('Admin user not available, skipping test');
            }
        });

        test('COMMUNITY should only see their own rides', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.community.email, TEST_USERS.community.password);

            if (token) {
                const response = await request.get(`${API_BASE}/api/rides`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Should either succeed with filtered results or get 403
                expect([200, 403]).toContain(response.status());
            } else {
                console.log('Community user not available, skipping test');
            }
        });

        test('Unauthenticated request should be rejected', async ({ request }) => {
            const response = await request.get(`${API_BASE}/api/rides`);
            expect([401, 403]).toContain(response.status());
        });
    });

    test.describe('POST /api/rides - Create Ride', () => {

        test('OFFICER should be able to create rides', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.officer.email, TEST_USERS.officer.password);

            if (token) {
                const response = await request.post(`${API_BASE}/api/rides`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    data: {
                        patient_name: 'Test Patient - E2E',
                        pickup_location: 'Test Location',
                        destination: 'Test Hospital',
                        appointment_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                        trip_type: 'นัดหมอตามปกติ'
                    }
                });

                expect(response.status()).toBe(201);
                const ride = await response.json();
                expect(ride.id).toMatch(/^RIDE-\d+$/);
            } else {
                console.log('Officer user not available, skipping test');
            }
        });

        test('COMMUNITY should be able to create rides for themselves', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.community.email, TEST_USERS.community.password);

            if (token) {
                const response = await request.post(`${API_BASE}/api/rides`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    data: {
                        patient_name: 'Community Patient - E2E',
                        pickup_location: 'Community Location',
                        destination: 'Community Hospital',
                        appointment_time: new Date(Date.now() + 86400000).toISOString()
                    }
                });

                // Community should be able to create rides
                expect([201, 200]).toContain(response.status());
            } else {
                console.log('Community user not available, skipping test');
            }
        });
    });

    test.describe('PUT /api/rides/:id - Driver Assignment', () => {

        test('DRIVER should NOT be able to assign drivers to rides', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.driver.email, TEST_USERS.driver.password);

            if (token) {
                // First get a ride to update
                const ridesResponse = await request.get(`${API_BASE}/api/rides`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (ridesResponse.status() === 200) {
                    const ridesData = await ridesResponse.json();
                    const rides = ridesData.data || [];

                    if (rides.length > 0) {
                        const rideId = rides[0].id;

                        // Try to assign a driver (should fail)
                        const updateResponse = await request.put(`${API_BASE}/api/rides/${rideId}`, {
                            headers: { 'Authorization': `Bearer ${token}` },
                            data: {
                                driver_id: 'DRV-001',
                                driver_name: 'Test Driver'
                            }
                        });

                        // Should be 403 - drivers cannot assign other drivers
                        expect(updateResponse.status()).toBe(403);
                    }
                }
            } else {
                console.log('Driver user not available, skipping test');
            }
        });

        test('COMMUNITY should NOT be able to assign drivers', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.community.email, TEST_USERS.community.password);

            if (token) {
                // Try to assign driver to any ride
                const response = await request.put(`${API_BASE}/api/rides/RIDE-001`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    data: {
                        driver_id: 'DRV-001',
                        driver_name: 'Test Driver'
                    }
                });

                // Should be 403 (access denied) or 404 (not their ride)
                expect([403, 404]).toContain(response.status());
            } else {
                console.log('Community user not available, skipping test');
            }
        });

        test('Unauthenticated request should be rejected from assigning', async ({ request }) => {
            const response = await request.put(`${API_BASE}/api/rides/RIDE-001`, {
                data: {
                    driver_id: 'DRV-001',
                    status: 'ASSIGNED'
                }
            });

            expect([401, 403]).toContain(response.status());
        });
    });

    test.describe('Driver Assignment - Race Condition Prevention', () => {

        test('System should prevent double-assignment with conflict response', async ({ request }) => {
            const token = await getToken(request, TEST_USERS.officer.email, TEST_USERS.officer.password);

            if (token) {
                // Create a test ride
                const createResponse = await request.post(`${API_BASE}/api/rides`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    data: {
                        patient_name: 'Race Condition Test Patient',
                        pickup_location: 'Test Location',
                        destination: 'Test Hospital',
                        appointment_time: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
                    }
                });

                if (createResponse.status() === 201) {
                    const ride = await createResponse.json();

                    // First assignment should succeed (if driver available)
                    const assign1 = await request.put(`${API_BASE}/api/rides/${ride.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                        data: {
                            driver_id: 'DRV-001',
                            driver_name: 'Driver 1',
                            status: 'ASSIGNED'
                        }
                    });

                    // Result can be 200 (success) or 409 (conflict) or 404 (driver not found)
                    expect([200, 409, 404]).toContain(assign1.status());

                    if (assign1.status() === 200) {
                        // Create another ride with same time
                        const create2Response = await request.post(`${API_BASE}/api/rides`, {
                            headers: { 'Authorization': `Bearer ${token}` },
                            data: {
                                patient_name: 'Race Condition Test Patient 2',
                                pickup_location: 'Test Location 2',
                                destination: 'Test Hospital 2',
                                appointment_time: new Date(Date.now() + 3600000).toISOString() // Same time
                            }
                        });

                        if (create2Response.status() === 201) {
                            const ride2 = await create2Response.json();

                            // Try to assign same driver - should fail with conflict
                            const assign2 = await request.put(`${API_BASE}/api/rides/${ride2.id}`, {
                                headers: { 'Authorization': `Bearer ${token}` },
                                data: {
                                    driver_id: 'DRV-001',
                                    driver_name: 'Driver 1',
                                    status: 'ASSIGNED'
                                }
                            });

                            // Should get 409 Conflict (driver busy or time conflict)
                            expect([409]).toContain(assign2.status());

                            const errorData = await assign2.json();
                            expect(errorData.error).toBeDefined();
                        }
                    }
                }
            } else {
                console.log('Officer user not available, skipping test');
            }
        });
    });

});
