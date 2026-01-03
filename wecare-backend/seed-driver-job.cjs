const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'wecare.db');
const db = new Database(dbPath);

try {
    // 1. Find a driver (linked to driver1@wecare.dev if possible, or just the first one)
    const user = db.prepare("SELECT * FROM users WHERE email = 'driver1@wecare.dev'").get();

    let driverId;

    if (user) {
        console.log('Found user:', user.email);
        const driver = db.prepare("SELECT * FROM drivers WHERE user_id = ?").get(user.id);
        if (driver) {
            driverId = driver.id;
            console.log('Found linked driver profile:', driver.full_name, `(${driverId})`);
        }
    }

    if (!driverId) {
        const anyDriver = db.prepare("SELECT * FROM drivers LIMIT 1").get();
        if (anyDriver) {
            driverId = anyDriver.id;
            console.log('Using fallback driver:', anyDriver.full_name, `(${driverId})`);
        } else {
            throw new Error('No drivers found in database!');
        }
    }

    // 1.5 Find or Create a Patient
    let patientId;
    // Try to find a patient, handling potential schema differences
    try {
        const anyPatient = db.prepare("SELECT id FROM patients LIMIT 1").get();
        if (anyPatient) {
            patientId = anyPatient.id;
            console.log('Using existing patient:', patientId);
        }
    } catch (e) {
        console.log('Error checking patients table:', e.message);
    }

    if (!patientId) {
        // Create a dummy patient
        patientId = 'PAT-TEST-' + Date.now();
        console.log('Creating new dummy patient:', patientId);

        // Check patients table schema to avoid errors
        const tableInfo = db.prepare("PRAGMA table_info(patients)").all();
        const columns = tableInfo.map(c => c.name);

        // Basic fields that should exist
        const insertFields = ['id', 'full_name', 'phone_number', 'address', 'created_at', 'updated_at'];
        const insertValues = [patientId, 'Test Patient', '0899999999', 'Test Address', new Date().toISOString(), new Date().toISOString()];

        // Add optional fields if they exist
        if (columns.includes('gender')) { insertFields.push('gender'); insertValues.push('Male'); }
        if (columns.includes('date_of_birth')) { insertFields.push('date_of_birth'); insertValues.push('1990-01-01'); }
        if (columns.includes('id_card_number')) { insertFields.push('id_card_number'); insertValues.push('1234567890123'); }

        const placeholders = insertValues.map(() => '?').join(',');
        const sql = `INSERT INTO patients (${insertFields.join(',')}) VALUES (${placeholders})`;

        db.prepare(sql).run(...insertValues);
    }

    // 2. Create a dummy ride assigned to this driver
    const rideId = `RIDE-TEST-${Date.now()}`;
    const stmt = db.prepare(`
        INSERT INTO rides (
            id, patient_id, patient_name, pickup_location, destination, 
            appointment_time, status, driver_id, trip_type, created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    `);

    const now = new Date();
    const appointmentTime = new Date(now.getTime() + 3600000).toISOString(); // 1 hour from now

    stmt.run(
        rideId,
        patientId,
        'Test Patient for Driver',
        'Test Pickup Location',
        'Test Destination Hospital',
        appointmentTime,
        'ASSIGNED',
        driverId,
        'URGENT',
        now.toISOString(),
        now.toISOString()
    );

    console.log(`✅ Successfully seeded ride ${rideId} for driver ${driverId}`);

} catch (error) {
    console.error('❌ Error seeding ride:', error.message);
    process.exit(1);
}
