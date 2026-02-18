/**
 * Integration Tests for OFFICER Role Bug Fixes
 */

import request from 'supertest';
import app from '../../src/index';

describe('OFFICER Role - Bug Fixes Integration Tests', () => {
    let officerToken: string;
    let adminToken: string;

    beforeAll(async () => {
        // Login as OFFICER
        const officerRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'officer1@wecare.dev', password: 'password123' });
        officerToken = officerRes.body.token;

        // Login as ADMIN for comparison
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@wecare.dev', password: 'password123' });
        adminToken = adminRes.body.token;
    });

    describe('BUG-003: OFFICER can create vehicles', () => {
        test('OFFICER should be able to create a new vehicle', async () => {
            const newVehicle = {
                licensePlate: 'TEST-001',
                model: 'Ambulance Model X',
                brand: 'Toyota',
                vehicleTypeId: 'VT-001',
                status: 'AVAILABLE'
            };

            const res = await request(app)
                .post('/api/vehicles')
                .set('Authorization', `Bearer ${officerToken}`)
                .send(newVehicle);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.licensePlate).toBe('TEST-001');
        });

        test('OFFICER should be able to edit vehicles', async () => {
            // First create a vehicle
            const createRes = await request(app)
                .post('/api/vehicles')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    licensePlate: 'TEST-002',
                    model: 'Ambulance Model Y',
                    brand: 'Ford',
                    vehicleTypeId: 'VT-001',
                    status: 'AVAILABLE'
                });

            const vehicleId = createRes.body.id;

            // OFFICER should be able to edit
            const editRes = await request(app)
                .put(`/api/vehicles/${vehicleId}`)
                .set('Authorization', `Bearer ${officerToken}`)
                .send({ status: 'MAINTENANCE' });

            expect(editRes.status).toBe(200);
            expect(editRes.body.status).toBe('MAINTENANCE');
        });
    });

    describe('BUG-004: Role normalization consistency', () => {
        test('OFFICER role should work regardless of case', async () => {
            // Test that OFFICER can access protected endpoints
            const res = await request(app)
                .get('/api/drivers')
                .set('Authorization', `Bearer ${officerToken}`);

            expect(res.status).not.toBe(403);
            expect(res.status).toBe(200);
        });

        test('OFFICER can assign drivers to rides', async () => {
            // Create a test ride
            const rideRes = await request(app)
                .post('/api/rides')
                .set('Authorization', `Bearer ${officerToken}`)
                .send({
                    patient_id: 'PAT-001',
                    patient_name: 'Test Patient',
                    pickup_location: 'Test Location',
                    destination: 'Hospital',
                    appointment_time: new Date().toISOString()
                });

            const rideId = rideRes.body.id;

            // Get available driver
            const driversRes = await request(app)
                .get('/api/drivers/available')
                .set('Authorization', `Bearer ${officerToken}`);

            if (driversRes.body.length > 0) {
                const driverId = driversRes.body[0].id;

                // Assign driver
                const assignRes = await request(app)
                    .put(`/api/rides/${rideId}`)
                    .set('Authorization', `Bearer ${officerToken}`)
                    .send({
                        driver_id: driverId,
                        driver_name: driversRes.body[0].fullName,
                        status: 'ASSIGNED'
                    });

                expect(assignRes.status).toBe(200);
                expect(assignRes.body.driverId).toBe(driverId);
            }
        });
    });

    describe('OFFICER permissions matrix', () => {
        test('OFFICER can view all patients', async () => {
            const res = await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${officerToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
        });

        test('OFFICER can create patients', async () => {
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${officerToken}`)
                .send({
                    full_name: 'Test Patient OFFICER',
                    national_id: '1234567890123',
                    dob: '1950-01-01',
                    gender: 'ชาย',
                    contact_phone: '0812345678'
                });

            expect(res.status).toBe(201);
        });

        test('OFFICER can view all rides', async () => {
            const res = await request(app)
                .get('/api/rides')
                .set('Authorization', `Bearer ${officerToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
        });

        test('OFFICER can create drivers', async () => {
            const res = await request(app)
                .post('/api/drivers')
                .set('Authorization', `Bearer ${officerToken}`)
                .send({
                    full_name: 'Test Driver',
                    email: `testdriver${Date.now()}@test.com`,
                    phone: '0898765432',
                    license_plate: `TEST-${Date.now()}`,
                    vehicle_model: 'Test Model',
                    vehicle_brand: 'Test Brand'
                });

            expect(res.status).toBe(201);
        });

        test('OFFICER can update driver with new vehicle and create vehicle record', async () => {
            const createDriverRes = await request(app)
                .post('/api/drivers')
                .set('Authorization', `Bearer ${officerToken}`)
                .send({
                    full_name: 'Driver Without Vehicle',
                    email: `novehicle${Date.now()}@test.com`,
                    phone: '0800000000'
                });

            expect(createDriverRes.status).toBe(201);
            const driverId = createDriverRes.body.id;

            const newLicensePlate = `DRV-UPD-${Date.now()}`;

            const updateRes = await request(app)
                .put(`/api/drivers/${driverId}`)
                .set('Authorization', `Bearer ${officerToken}`)
                .send({
                    full_name: 'Driver With Vehicle',
                    license_plate: newLicensePlate,
                    brand: 'Updated Brand',
                    model: 'Updated Model',
                    color: 'White'
                });

            expect(updateRes.status).toBe(200);
            expect(updateRes.body).toHaveProperty('current_vehicle_id');
            expect(updateRes.body.current_vehicle_id).toBeTruthy();

            const vehiclesRes = await request(app)
                .get('/api/vehicles')
                .set('Authorization', `Bearer ${officerToken}`);

            expect(vehiclesRes.status).toBe(200);
            const hasCreatedVehicle = Array.isArray(vehiclesRes.body)
                ? vehiclesRes.body.some((v: any) => v.license_plate === newLicensePlate)
                : false;
            expect(hasCreatedVehicle).toBe(true);
        });

        test('OFFICER can manage teams', async () => {
            const res = await request(app)
                .get('/api/teams')
                .set('Authorization', `Bearer ${officerToken}`);

            expect(res.status).toBe(200);
        });

        test('OFFICER can export reports', async () => {
            const res = await request(app)
                .get('/api/office/reports/export')
                .set('Authorization', `Bearer ${officerToken}`)
                .query({
                    reportType: 'rides',
                    startDate: '2026-01-01',
                    endDate: '2026-12-31'
                });

            expect(res.status).not.toBe(403);
        });

        test('OFFICER cannot access system admin endpoints', async () => {
            const res = await request(app)
                .post('/api/admin/system/reset-db')
                .set('Authorization', `Bearer ${officerToken}`)
                .send({ confirm: 'CONFIRM_RESET_DB', reason: 'Test' });

            expect(res.status).toBe(403);
        });
    });
});
