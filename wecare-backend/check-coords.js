const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/wecare.db');
const db = new Database(dbPath);

try {
    const patients = db.prepare("SELECT full_name, latitude, longitude FROM patients WHERE latitude IS NOT NULL LIMIT 5").all();
    console.log('Sample Patient Locations:');
    console.log(JSON.stringify(patients, null, 2));
} catch (error) {
    console.error('Error:', error);
} finally {
    db.close();
}
