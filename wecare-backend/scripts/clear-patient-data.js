const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/wecare.db');
const db = new Database(dbPath);

try {
    console.log('🧹 Cleaning up Patient and Ride data...');

    // 1. Delete all Rides (since they depend on Patients)
    const deleteRides = db.prepare('DELETE FROM rides');
    const ridesResult = deleteRides.run();
    console.log(`✅ Deleted ${ridesResult.changes} rides.`);

    // 2. Delete all Patients
    const deletePatients = db.prepare('DELETE FROM patients');
    const patientsResult = deletePatients.run();
    console.log(`✅ Deleted ${patientsResult.changes} patients.`);

    // Optional: Reset SQLite Sequence (Auto Increment IDs) if needed
    // db.prepare("DELETE FROM sqlite_sequence WHERE name='patients' OR name='rides'").run();

    console.log('✨ Database is clean and ready for new tests!');

} catch (error) {
    console.error('❌ Error cleaning database:', error);
} finally {
    db.close();
}
