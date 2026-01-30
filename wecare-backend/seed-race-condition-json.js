/**
 * Seed JSON Data for Race Condition Test (BUG-006)
 * Updates drivers.json and rides.json
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'db', 'data');
const DRIVERS_FILE = path.join(DATA_DIR, 'drivers.json');
const RIDES_FILE = path.join(DATA_DIR, 'rides.json');

function seedJsonData() {
    console.log('🌱 Seeding JSON Data for Race Condition Test...\n');

    // 1. Update Drivers
    console.log('Updating drivers.json...');
    let drivers = [];
    try {
        const data = fs.readFileSync(DRIVERS_FILE, 'utf8');
        drivers = JSON.parse(data);
    } catch (e) {
        console.log('  Creating new drivers array');
    }

    const testDriver = {
        id: 'DRV-001',
        user_id: 'USR-DRV-001',
        full_name: 'Test Driver',
        status: 'AVAILABLE',
        phone: '0812345678',
        license_number: 'LIC-001',
        current_lat: 13.7563,
        current_lng: 100.5018
    };

    const driverIndex = drivers.findIndex(d => d.id === 'DRV-001');
    if (driverIndex >= 0) {
        drivers[driverIndex] = { ...drivers[driverIndex], ...testDriver };
        console.log('  Updated DRV-001');
    } else {
        drivers.push(testDriver);
        console.log('  Added DRV-001');
    }

    fs.writeFileSync(DRIVERS_FILE, JSON.stringify(drivers, null, 4));
    console.log('  ✅ drivers.json saved\n');

    // 2. Update Rides
    console.log('Updating rides.json...');
    let rides = [];
    try {
        const data = fs.readFileSync(RIDES_FILE, 'utf8');
        rides = JSON.parse(data);
    } catch (e) {
        console.log('  Creating new rides array');
    }

    const testRides = [
        {
            id: 'RIDE-TEST-001',
            patient_id: 'PAT-TEST-001',
            patient_name: 'Test Patient',
            pickup_location: '123 Test St',
            destination: 'Hospital A',
            appointment_time: '2026-01-06 10:00:00',
            status: 'PENDING',
            created_by: 'USR-001',
            created_at: new Date().toISOString()
        },
        {
            id: 'RIDE-TEST-002',
            patient_id: 'PAT-TEST-001',
            patient_name: 'Test Patient',
            pickup_location: '456 Test Ave',
            destination: 'Hospital B',
            appointment_time: '2026-01-06 14:00:00',
            status: 'PENDING',
            created_by: 'USR-001',
            created_at: new Date().toISOString()
        }
    ];

    for (const testRide of testRides) {
        const rideIndex = rides.findIndex(r => r.id === testRide.id);
        if (rideIndex >= 0) {
            rides[rideIndex] = testRide;
            console.log(`  Updated ${testRide.id}`);
        } else {
            rides.push(testRide);
            console.log(`  Added ${testRide.id}`);
        }
    }

    fs.writeFileSync(RIDES_FILE, JSON.stringify(rides, null, 4));
    console.log('  ✅ rides.json saved\n');

    console.log('🎉 JSON Seed Complete!');
}

seedJsonData();
