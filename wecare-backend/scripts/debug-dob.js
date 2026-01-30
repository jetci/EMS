const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/wecare.db');
const db = new Database(dbPath);

try {
    const patient = db.prepare('SELECT id, full_name, dob FROM patients ORDER BY created_at DESC LIMIT 1').get();
    if (patient) {
        console.log('Patient ID:', patient.id);
        console.log('Name:', patient.full_name);
        console.log('DOB (Raw from DB):', patient.dob);
        console.log('Type of DOB:', typeof patient.dob);
    } else {
        console.log('No patients found.');
    }
} catch (error) {
    console.error('Error:', error);
} finally {
    db.close();
}
