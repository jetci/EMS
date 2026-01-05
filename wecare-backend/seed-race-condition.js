/**
 * Seed Data for Race Condition Test (Final Correct Schema)
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db', 'wecare.db');

function seedRaceConditionData() {
    console.log('🌱 Seeding Race Condition Test Data...\n');

    const db = new Database(DB_PATH);

    // 1. Ensure User USR-001 exists (Admin) - we know it does from previous fix
    console.log('Checking USR-001...');
    const admin = db.prepare('SELECT id FROM users WHERE id = ?').get('USR-001');
    if (!admin) {
        console.log('  ⚠️ USR-001 not found! This should not happen if you ran final-fix-users.js');
        // We could insert it, but let's assume it exists or use what exists
    } else {
        console.log('  ✅ USR-001 found');
    }

    // 2. Setup Patient PAT-TEST-001
    console.log('\nSetup Patient PAT-TEST-001...');
    const patientExists = db.prepare('SELECT id FROM patients WHERE id = ?').get('PAT-TEST-001');

    if (!patientExists) {
        db.prepare(`INSERT INTO patients (id, full_name, created_by) VALUES (?, ?, ?)`).run(
            'PAT-TEST-001', 'Test Patient', 'USR-001'
        );
        console.log('  ✅ Patient PAT-TEST-001 created');
    } else {
        console.log('  ✅ Patient PAT-TEST-001 exists');
    }

    // 3. Setup Driver DRV-001
    console.log('\nSetup Driver DRV-001...');
    const driverExists = db.prepare('SELECT id FROM drivers WHERE id = ?').get('DRV-001');

    if (driverExists) {
        db.prepare('UPDATE drivers SET status = ?, full_name = ? WHERE id = ?').run('AVAILABLE', 'Test Driver', 'DRV-001');
        console.log('  ✅ Driver DRV-001 updated to AVAILABLE');
    } else {
        db.prepare(`INSERT INTO drivers (id, user_id, full_name, status, phone, license_number) 
                    VALUES (?, ?, ?, ?, ?, ?)`).run(
            'DRV-001', 'USR-DRV-001', 'Test Driver', 'AVAILABLE', '0812345678', 'LIC-001'
        );
        console.log('  ✅ Driver DRV-001 created');
    }

    // 4. Setup Rides
    console.log('\nSetup Rides...');
    const rides = ['RIDE-TEST-001', 'RIDE-TEST-002'];

    const insertRide = db.prepare(`
        INSERT INTO rides (
            id, patient_id, patient_name, pickup_location, destination, 
            appointment_time, status, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    for (const rideId of rides) {
        // Delete if exists
        db.prepare('DELETE FROM rides WHERE id = ?').run(rideId);

        // Insert
        insertRide.run(
            rideId,
            'PAT-TEST-001',
            'Test Patient',
            '123 Test St',
            'Hospital A',
            '2026-01-06 10:00:00',
            'PENDING',
            'USR-001' // Admin
        );
        console.log(`  ✅ Ride ${rideId} created (PENDING)`);
    }

    db.close();
    console.log('\n🎉 Seed Complete! Ready for Race Condition Test.');
}

seedRaceConditionData();
